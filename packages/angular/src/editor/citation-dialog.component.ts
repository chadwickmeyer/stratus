// Angular Core
import {
    ChangeDetectorRef,
    Component,
    Inject,
    OnInit
} from '@angular/core'
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators
} from '@angular/forms'

// Angular Material
import {
    MAT_DIALOG_DATA,
    MatDialogRef
} from '@angular/material/dialog'
import {
    MatSnackBar
} from '@angular/material/snack-bar'

// RXJS
import {
    Observable, Subscriber
} from 'rxjs'

// External
import {snakeCase, isEmpty, isString, isUndefined, uniqueId} from 'lodash'
import {
    Stratus
} from '@stratusjs/runtime/stratus'
import {cookie} from '@stratusjs/core/environment'

// Services
import {
    BackendService
} from '@stratusjs/angular/backend.service'
import {
    LooseFunction,
    LooseObject
} from '@stratusjs/core/misc'
import {Model} from '@stratusjs/angularjs/services/model'
import {TriggerInterface} from '@stratusjs/angular/core/trigger.interface'

// Extends
import {
    ResponsiveComponent
} from '@stratusjs/angular/core/responsive.component'
// import {ContentEntity} from '@stratusjs/angular/data/content.interface'
import {IconOptions, MatIconRegistry} from '@angular/material/icon'
import {DomSanitizer} from '@angular/platform-browser'
import {InputButtonPlugin} from '@stratusjs/angular/froala/plugins/inputButton'

// Local Setup
const systemDir = '@stratusjs/angular'
const moduleName = 'citation-dialog'
const parentModuleName = 'editor'

// Directory Template
const min = !cookie('env') ? '.min' : ''
const localDir = `${Stratus.BaseUrl}${boot.configuration.paths[`${systemDir}/*`].replace(/[^/]*$/, '')}`

/**
 * @title Dialog for Nested Tree
 */
@Component({
    selector: `sa-${moduleName}`,
    templateUrl: `${localDir}/${parentModuleName}/${moduleName}.component${min}.html`,
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class CitationDialogComponent extends ResponsiveComponent implements OnInit {

    // Basic Component Settings
    title = moduleName + '_component'
    uid: string

    // Dependencies
    Stratus = Stratus

    dialogCitationForm: FormGroup
    popupTitle = 'Create New Citation'
    warningMessage?: string
    isPopupLoading = true
    formDisabled = false

    // Model Settings
    model: Model
    property: string

    // Event Settings
    editor: TriggerInterface
    eventManager: InputButtonPlugin<string>
    baseEditor: LooseObject & {
        citationManager: LooseObject<LooseFunction>
        selection: LooseObject<LooseFunction> & {
            element(): Element // entire element surrounding the highlighted text (maybe be inaccurate due to froala selection tags)
            endElement(): Element // entire element surrounding the highlighted text
            text(): string // only the highlighted text
        }
    }
    highlightedText: string // The originally highlighted text (incase selection changes)
    newCitation = true
    existingCitationElement?: Element

    // Icon Localization
    svgIcons: {
        [key: string]: string
    } = {}

    constructor(
        public dialogRef: MatDialogRef<CitationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: CitationDialogData,
        private fb: FormBuilder,
        private backend: BackendService,
        private snackBar: MatSnackBar,
        private iconRegistry: MatIconRegistry,
        private sanitizer: DomSanitizer,
        protected ref: ChangeDetectorRef
    ) {
        // Chain constructor
        super()

        // Manually render upon data change
        // ref.detach()
    }

    ngOnInit() {
        // Initialization
        this.uid = uniqueId(`sa_${snakeCase(moduleName)}_component_`)
        Stratus.Instances[this.uid] = this

        // Load Component CSS until System.js can import CSS properly.
        // Stratus.Internals.CssLoader(`${localDir}${parentModuleName}/${moduleName}.component${min}.css`)

        // Hoist Data
        this.model = this.data.model
        this.property = this.data.property
        this.editor = this.data.editor
        this.eventManager = this.data.eventManager
        this.baseEditor = this.data.eventManager.editor

        // Form Logic
        this.dialogCitationForm = this.fb.group({
            citationElementInput: new FormControl('', [Validators.required]),
            citationTitleInput: ''
        })

        this.highlightedText = this.baseEditor.selection.text()
        // Let's figure out if this is going to make a new citation or update an existing
        const containedElement = this.baseEditor.selection.endElement()
        const containedElementName = containedElement.tagName
        if (containedElementName === 'STRATUS-CITATION') {
            this.newCitation = false
            this.existingCitationElement = containedElement
            // console.log('We selected an existing citation, so we\'ll be only updating it (ignore highlighted text)')
            const copiedElement = containedElement.cloneNode(true) as Element
            // if text is highlighted, we need to manually remove all the styling froala injected
            Array.from(copiedElement.getElementsByClassName('fr-marker')).forEach((markerEl)=>{
                markerEl.remove()
            })
            // Set all the contents of this existing Citation as edittable
            this.dialogCitationForm.get('citationElementInput').setValue(copiedElement.innerHTML)
        }
        if (this.newCitation && !isEmpty(this.highlightedText)) {
            this.popupTitle = 'Convert Text into Citation'
            this.dialogCitationForm.get('citationElementInput').setValue(this.highlightedText)
        }

        if (!this.newCitation) {
            this.popupTitle = 'Update Citation'
        }

        // FIXME: We have to go in this roundabout way to force changes to be detected since the
        // Dialog Sub-Components don't seem to have the right timing for ngOnInit
        this.isPopupLoading = false
        this.refresh()
    }

    cancel(): void {
        this.dialogRef.close()
        this.refresh()
    }

    confirm() {
        if (isUndefined(this.dialogCitationForm.get('citationElementInput'))) {
            return
        }
        const content = this.dialogCitationForm.get('citationElementInput').value
        if (isUndefined(content) || !isString(content)) {
            return
        }
        const title = this.dialogCitationForm.get('citationTitleInput').value
        const citationElement = this.createCitation(content, title)
        if (!citationElement) {
            console.warn(`${moduleName}: unable to build citation for: ${content}`)
            this.snackBar.open(`Unable to build citation for: ${content}.`, 'dismiss', {
                duration: 5000,
                horizontalPosition: 'right',
                verticalPosition: 'bottom'
            })
            return
        }

        if (!this.eventManager) {
            console.warn(`${moduleName}: event manager is not set.`)
            return
        }

        // this.baseEditor.selection.restore()
        // if this is a new element, we can insert... however if this is existing, we only want to update the existing element
        if (!this.newCitation && this.existingCitationElement) {
            // The selection tool is not working properly... so we are just going to directly alter the existing element
            this.existingCitationElement.outerHTML = citationElement
        } else {
            this.eventManager.trigger('insert', citationElement, this.editor)
            // this.baseEditor.html.insert(citationElement) // same effect as above trigger
        }
        this.dialogRef.close()
    }

    createCitation (content: string, title?: string): string|null {
        if (!content) {
            console.warn(`${moduleName}: unable to create citation for empty content`)
            return null
        }

        return isEmpty(title) ? `<stratus-citation>${content}</stratus-citation>` : `<stratus-citation data-title="${title}">${content}</stratus-citation>`
    }

    getSvg(url: string, options?: IconOptions): Observable<string> {
        const uid = this.addSvgIcon(url, options)
        return new Observable<string>((subscriber: Subscriber<string>) => {
            this.iconRegistry
                .getNamedSvgIcon(uid)
                .subscribe({
                    /* *
                     next(svg: SVGElement) {
                     console.log(`getSvg(${url}):`, svg)
                     },
                     /* */
                    error(err) {
                        console.error(`getSvg(${url}): ${err}`)
                    },
                    complete() {
                        // console.log(`getSvg(${url}): completed`)
                        subscriber.next(uid)
                    }
                })
        })
    }

    /**
     * This function marks a url safe with the DomSanitizer and returns a uid
     * https://material.angular.io/components/icon/overview#svg-icons
     */
    addSvgIcon(url: string, options?: IconOptions) : string {
        if (url in this.svgIcons) {
            return this.svgIcons[url]
        }
        if (!options) {
            options = {}
        }
        const uid = this.svgIcons[url] = uniqueId('selector_svg')
        this.iconRegistry.addSvgIcon(uid, this.sanitizer.bypassSecurityTrustResourceUrl(url), options)
        return uid
    }
}

// Data Types
export interface CitationDialogData {
    editor: TriggerInterface
    eventManager: InputButtonPlugin<string>
    form: FormGroup,
    model: Model,
    property: string
}
