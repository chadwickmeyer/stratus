/**
 * @file IdxMemberList Component @stratusjs/idx/member/list.component
 * @example <stratus-idx-member-list>
 * @see https://github.com/Sitetheory/stratus/wiki/Idx-Member-List-Widget
 */

// Compile Stylesheets
import './list.component.less'

// Runtime
import {clone, forEach, isString} from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import {
    element, material, IAnchorScrollService, IAttributes, IQService, IRootScopeService, ITimeoutService, IWindowService
} from 'angular'
import 'angular-material'
import 'angular-sanitize'
import {
    CompileFilterOptions,
    IdxEmitter,
    IdxListScope,
    IdxService,
    Member
} from '@stratusjs/idx/idx'
import {Collection} from '@stratusjs/angularjs/services/collection' // Needed as Class
import {isJSON, LooseObject, safeUniqueId} from '@stratusjs/core/misc'
import {cookie} from '@stratusjs/core/environment'

// Environment
const min = !cookie('env') ? '.min' : ''
const packageName = 'idx'
const moduleName = 'member'
const componentName = 'list'
// There is not a very consistent way of pathing in Stratus at the moment
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/${moduleName}/`
const localDistStyle = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/dist/${packageName}.bundle.min.css`

export type IdxMemberListScope = IdxListScope<Member> & {
    options: CompileFilterOptions // FIXME rename to query
    query: CompileFilterOptions

    detailsLinkPopup: boolean
    detailsLinkUrl: string
    detailsLinkTarget: 'popup' | '_self' | '_blank'
    googleApiKey?: string

    variableSyncing?: LooseObject

    displayModelDetails(model: Member, ev?: any): void
    injectMemberDetails(member: any): Promise<void>
    variableInject(member: Member): Promise<void>
}

Stratus.Components.IdxMemberList = {
    bindings: {
        // TODO wiki docs
        elementId: '@',
        tokenUrl: '@',
        detailsLinkPopup: '@',
        detailsLinkUrl: '@',
        detailsLinkTarget: '@',
        orderOptions: '@',
        options: '@',
        template: '@',
        variableSync: '@'
    },
    controller(
        $anchorScroll: IAnchorScrollService,
        $attrs: IAttributes,
        $q: IQService,
        $mdDialog: material.IDialogService,
        $rootScope: IRootScopeService,
        $scope: IdxMemberListScope,
        $timeout: ITimeoutService,
        $window: IWindowService,
        Idx: IdxService,
    ) {
        // Initialize
        $scope.uid = safeUniqueId(packageName, moduleName, componentName)
        $scope.elementId = $attrs.elementId || $scope.uid
        Stratus.Instances[$scope.elementId] = $scope
        if ($attrs.tokenUrl) {
            Idx.setTokenURL($attrs.tokenUrl)
        }
        // Stratus.Internals.CssLoader(`${localDir}${$attrs.template || componentName}.component${min}.css`).then()
        Stratus.Internals.CssLoader(localDistStyle).then()

        let defaultOptions: LooseObject

        /**
         * All actions that happen first when the component loads
         * Needs to be placed in a function, as the functions below need to the initialized first
         */
        this.$onInit = async () => {
            /**
             * Allow options to be loaded initially from the URL
             */
            $scope.urlLoad = $attrs.urlLoad && isJSON($attrs.urlLoad) ? JSON.parse($attrs.urlLoad) : true
            $scope.detailsLinkPopup = $attrs.detailsLinkPopup && isJSON($attrs.detailsLinkPopup) ?
                JSON.parse($attrs.detailsLinkPopup) : true
            $scope.detailsLinkUrl = $attrs.detailsLinkUrl || '/property/member/details'
            $scope.detailsLinkTarget = $attrs.detailsLinkTarget || '_self'

            $scope.options = $attrs.options && isJSON($attrs.options) ? JSON.parse($attrs.options) : {}

            $scope.options.order ??= null// will be set by Service
            $scope.options.page ??= null// will be set by Service
            $scope.options.perPage ??= 25
            $scope.options.images ??= {limit: 1}

            $scope.options.where ??= {}
            // Fixme, sometimes it's just MemberMlsAccessYN ....
            // $scope.options.where.MemberStatus ??= {inq: ['Active', 'Yes', 'TRUE']}

            // $scope.options.where.MemberKey ??= '91045'
            // $scope.options.where.AgentLicense ??= []*/

            defaultOptions = JSON.parse(JSON.stringify($scope.options.where))// Extend/clone doesn't work for arrays

            /* $scope.orderOptions ??= {
              'Price (high to low)': '-ListPrice',
              'Price (low to high)': 'ListPrice'
            } */

            // $scope.googleApiKey = $attrs.googleApiKey || null

            // Register this List with the Property service
            Idx.registerListInstance($scope.elementId, moduleName, $scope)

            const urlOptions: { Search?: any } = {}
            /* if ($scope.urlLoad) {
              // first set the UrlOptions via defaults (cloning so it can't be altered)
              Idx.setUrlOptions('Search', JSON.parse(JSON.stringify(defaultOptions)))
              // Load Options from the provided URL settings
              urlOptions = Idx.getOptionsFromUrl()
              // If a specific listing is provided, be sure to pop it up as well
              if (
                urlOptions.Listing.service
                && urlOptions.Listing.ListingKey
              ) {
                $scope.displayPropertyDetails(urlOptions.Listing)
              }
            } */

            await $scope.search(urlOptions.Search, true, false)
            Idx.emit('init', $scope)
        }

        $scope.$watch('collection.models', () => { // models?: []
            if ($scope.collection.completed) {
                Idx.emit('collectionUpdated', $scope, $scope.collection)
            }
        })

        $scope.getPageModels = (): Member[] => {
            // console.log('checking $scope.collection.models', $scope.collection.models)
            const members: Member[] = []
            // only get the page's models, not every single model in collection
            const models = $scope.collection.models as Member[]
            models.slice(
                ($scope.query.perPage * ($scope.query.page - 1)), // 20 * (1 - 1) = 0. 20 * (2 - 1) = 20
                ($scope.query.perPage * $scope.query.page) // e.g. 20 * 1 = 20. 20 * 2 = 40
            ).forEach((member) => {
                members.push(member)
            })
            return members
        }

        $scope.scrollToModel = (model: Member): void => {
            $anchorScroll(`${$scope.elementId}_${model._id}`)
        }

        /**
         * Functionality called when a search widget runs a query after the page has loaded
         * may update the URL options, so it may not be ideal to use on page load
         * TODO Idx needs to export search options interface
         */
        $scope.search = $scope.searchMembers = async (
            options?: CompileFilterOptions, // FIXME rename to query
            refresh?: boolean,
            updateUrl?: boolean
        ): Promise<Collection<Member>> =>
            $q(async (resolve: any) => {
                options ??= {}
                updateUrl = updateUrl === false ? updateUrl : true

                // If refreshing, reset to page 1
                if (refresh) {
                    $scope.options.page = 1
                }
                // If search options sent, update the Widget. Otherwise use the widgets current where settings
                if (options.where && Object.keys(options.where).length > 0) {
                    delete ($scope.options.where)
                    $scope.options.where = options.where
                    if ($scope.options.where.Page) {
                        $scope.options.page = $scope.options.where.Page
                        delete ($scope.options.where.Page)
                    }
                    if ($scope.options.where.Order) {
                        $scope.options.order = $scope.options.where.Order
                        delete ($scope.options.where.Order)
                    }
                } else {
                    options = $scope.options.where || {}
                }
                // If a different page, set it in the URL
                if ($scope.options.page) {
                    options.Page = $scope.options.page
                }
                // Don't add Page/1 to the URL
                if (options.Page <= 1) {
                    delete (options.Page)
                }
                if ($scope.options.order && $scope.options.order.length > 0) {
                    options.Order = $scope.options.order
                }

                // Set the URL options
                // Idx.setUrlOptions('Search', options)

                // Display the URL options in the address bar
                /* if (updateUrl) {
                  Idx.refreshUrlOptions(defaultOptions)
                } */
                Idx.emit('searching', $scope, clone($scope.query))

                // Grab the new member listings
                // console.log('fetching members:', $scope.options)
                try {
                    // resolve(Idx.fetchProperties($scope, 'collection', $scope.query, refresh))
                    // Grab the new property listings
                    const results = await Idx.fetchMembers($scope.elementId, 'collection', $scope.options, refresh)
                    Idx.emit('searched', $scope, clone($scope.query))
                    resolve(results)
                } catch (e) {
                    console.error('Unable to fetchMembers:', e)
                }
            })

        /**
         * Move the displayed listings to a different page, keeping the current query
         * @param pageNumber - page number
         * @param ev - Click event
         */
        $scope.pageChange = async (pageNumber: number, ev?: any): Promise<void> => {
            if ($scope.collection.pending) {
                // Do do anything if the collection isn't ready yet
                return
            }
            // Idx.emit('pageChanging', $scope, clone($scope.query.page))
            Idx.emit('pageChanging', $scope, clone($scope.options.page))
            if (ev) {
                ev.preventDefault()
            }
            $scope.options.page = pageNumber
            await $scope.search()
            // Idx.emit('pageChanged', $scope, clone($scope.query.page))
            Idx.emit('pageChanged', $scope, clone($scope.options.page))
        }

        /**
         * Move the displayed listings to the next page, keeping the current query
         * @param ev - Click event
         */
        $scope.pageNext = async (ev?: any): Promise<void> => {
            if ($scope.collection.pending) {
                // Do do anything if the collection isn't ready yet
                return
            }
            if (!$scope.options.page) {
                $scope.options.page = 1
            }
            if ($scope.collection.completed && $scope.options.page < $scope.collection.meta.data.totalPages) {
                if (isString($scope.options.page)) {
                    $scope.options.page = parseInt($scope.options.page, 10)
                }
                await $scope.pageChange($scope.options.page + 1, ev)
            }
        }

        /**
         * Move the displayed listings to the previous page, keeping the current query
         * @param ev - Click event
         */
        $scope.pagePrevious = async (ev?: any): Promise<void> => {
            if ($scope.collection.pending) {
                // Do do anything if the collection isn't ready yet
                return
            }
            if (!$scope.options.page) {
                $scope.options.page = 1
            }
            if ($scope.collection.completed && $scope.options.page > 1) {
                if (isString($scope.options.page)) {
                    $scope.options.page = parseInt($scope.options.page, 10)
                }
                const prev = $scope.options.page - 1 || 1
                await $scope.pageChange(prev, ev)
            }
        }

        /**
         * Change the Order/Sorting method and refresh new results
         * @param order - string and strings
         * @param ev - Click event
         */
        $scope.orderChange = async (order: string | string[], ev?: any): Promise<void> => {
            if ($scope.collection.pending) {
                // Do do anything if the collection isn't ready yet
                // TODO set old Order back?
                return
            }
            Idx.emit('orderChanging', $scope, clone(order))
            if (ev) {
                ev.preventDefault()
            }
            $scope.options.order = order
            await $scope.search(null, true, true)
            Idx.emit('orderChanged', $scope, clone(order))
        }

        $scope.highlightModel = (model: Member, timeout?: number): void => {
            timeout ??= 0
            model._unmapped ??= {}
            $scope.$applyAsync(() => {
                model._unmapped._highlight = true
            })
            if (timeout > 0) {
                $timeout(() => {
                    $scope.unhighlightModel(model)
                }, timeout)
            }
        }

        $scope.unhighlightModel = (model: Member): void => {
            if (model) {
                model._unmapped ??= {}
                $scope.$applyAsync(() => {
                    model._unmapped._highlight = false
                })
            }
        }

        /**
         * Either popup or load a new page with the
         * @param model - details object
         * @param ev - Click event
         */
        $scope.displayModelDetails = (model: Member, ev?: any): void => {
            if (ev) {
                ev.preventDefault()
                // ev.stopPropagation()
            }
            if ($scope.detailsLinkPopup === true) {
                // Opening a popup will load the propertyDetails and adjust the hashbang URL
                const templateOptions: {
                    element_id: string,
                    service: number,
                    'member-key': string,
                    'page-title': boolean,
                    'google-api-key'?: string,
                } = {
                    element_id: 'property_member_detail_popup',
                    service: model._ServiceId,
                    'member-key': model.MemberKey,
                    'page-title': true// update the page title
                }
                if ($scope.googleApiKey) {
                    templateOptions['google-api-key'] = $scope.googleApiKey
                }

                let template =
                    '<md-dialog aria-label="' + model.MemberKey + '">' +
                    '<stratus-idx-member-details '
                forEach(templateOptions, (optionValue, optionKey) => {
                    template += `${optionKey}='${optionValue}'`
                })
                template +=
                    '></stratus-idx-member-details>' +
                    '</md-dialog>'

                $mdDialog.show({
                    template,
                    parent: element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: true // Only for -xs, -sm breakpoints.
                })
                    .then(() => {
                    }, () => {
                        // Idx.setUrlOptions('Listing', {})
                        // Idx.refreshUrlOptions(defaultOptions)
                        // Revery page title back to what it was
                        Idx.setPageTitle()
                        // Let's destroy it to save memory
                        $timeout(() => Idx.unregisterDetailsInstance('property_member_detail_popup', 'member'), 10)
                    })
            } else {
                $window.open($scope.getDetailsURL(model), $scope.detailsLinkTarget)
            }
        }

        $scope.injectMemberDetails = async (member: any): Promise<void> => {
            // console.log('will add these details to a form', model)
            $rootScope.$applyAsync(async () => {
                await $scope.variableInject(member)
            })
        }

        /**
         * Sync Gutensite form variables to a Stratus scope
         * TODO move this to it's own directive/service
         */
        $scope.variableInject =
            async (member: Member): Promise<void> => {
                $scope.variableSyncing = $attrs.variableSync && isJSON($attrs.variableSync) ? JSON.parse($attrs.variableSync) : {}
                Object.keys($scope.variableSyncing).forEach(elementId => {
                    // promises.push(
                    // $q(async function (resolve, reject) {
                    const varElement = Idx.getInput(elementId)
                    if (varElement) {
                        // Form Input exists

                        if (Object.prototype.hasOwnProperty.call(member, $scope.variableSyncing[elementId])) {
                            varElement.val(member[$scope.variableSyncing[elementId]])
                        } else if (
                            $scope.variableSyncing[elementId] === 'MemberFullName' &&
                            Object.prototype.hasOwnProperty.call(member, 'MemberFirstName') &&
                            Object.prototype.hasOwnProperty.call(member, 'MemberLastName')
                        ) {
                            varElement.val(member.MemberFirstName + ' ' + member.MemberLastName)
                        } else if (
                            $scope.variableSyncing[elementId] === 'MemberFirstName' &&
                            !Object.prototype.hasOwnProperty.call(member, 'MemberFirstName') &&
                            Object.prototype.hasOwnProperty.call(member, 'MemberFullName')
                        ) {
                            const nameArray = member.MemberFullName.split(' ')
                            const firstName = nameArray.shift()
                            // let lastName = nameArray.join(' ')
                            varElement.val(firstName)
                        } else if (
                            $scope.variableSyncing[elementId] === 'MemberLastName' &&
                            !Object.prototype.hasOwnProperty.call(member, 'MemberLastName') &&
                            Object.prototype.hasOwnProperty.call(member, 'MemberFullName')
                        ) {
                            const nameArray = member.MemberFullName.split(' ')
                            // let firstName = nameArray.shift()
                            const lastName = nameArray.join(' ')
                            varElement.val(lastName)
                        } else if ($scope.variableSyncing[elementId] === 'OfficeNumber') {
                            if (Object.prototype.hasOwnProperty.call(member, 'OfficeMlsId')) {
                                varElement.val(member.OfficeMlsId)
                            } else if (Object.prototype.hasOwnProperty.call(member, 'OfficeKey')) {
                                varElement.val(member.OfficeKey)
                            }
                        }
                        varElement.triggerHandler('input')

                        // varElement.val(member.MemberFullName)

                        // let scopeVarPath = $scope.variableSyncing[elementId]
                        // convert into a real var path and set the intial value from the exiting form value
                        // await $scope.updateScopeValuePath(scopeVarPath, varElement.val())

                        // Creating watcher to update the input when the scope changes
                        // $scope.$watch(
                        // scopeVarPath,
                        // function (value) {
                        // console.log('updating', scopeVarPath, 'value to', value, 'was', varElement.val())
                        // varElement.val(value)
                        // },
                        // true
                        // )
                    }
                })
                // await $q.all(promises)
            }

        $scope.on = (emitterName: string, callback: IdxEmitter) => Idx.on($scope.elementId, emitterName, callback)

        $scope.remove = (): void => {
        }
    },
    templateUrl: ($attrs: IAttributes): string => `${localDir}${$attrs.template || componentName}.component${min}.html`
}
