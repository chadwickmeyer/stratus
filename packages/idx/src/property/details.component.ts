// IdxPropertyDetails Component
// @stratusjs/idx/property/details.component
// <stratus-idx-property-details>
// --------------

// Runtime
import * as _ from 'lodash'
import * as Stratus from 'stratus'
import * as angular from 'angular'

// Angular 1 Modules
import 'angular-material'
import 'angular-sanitize'

// Libraries
import moment from 'moment'

// Services
import '@stratusjs/angularjs/services/model' // Needed as $provider
import {Model} from '@stratusjs/angularjs/services/model' // Needed as Class
import '@stratusjs/idx/idx'
import {MLSService} from '@stratusjs/idx/idx'

// FIXME move filters to @stratusjs
// Custom Filters
import 'stratus.filters.math'
import 'stratus.filters.moment'

// Component Preload
// import 'stratus.components.propertyDetailsSubSection'
import '@stratusjs/idx/property/details-sub-section.component'
// stratus.components.carousel doesn't work

// Stratus Dependencies
import {isJSON} from '@stratusjs/core/misc'
import {camelToSnake} from '@stratusjs/core/conversion'

// Environment
const min = Stratus.Environment.get('production') ? '.min' : ''
const packageName = 'idx'
const moduleName = 'property'
const componentName = 'details'
// There is not a very consistent way of pathing in Stratus at the moment
const localDir = `/${boot.bundle}node_modules/@stratusjs/${packageName}/src/${moduleName}/`

Stratus.Components.IdxPropertyDetails = {
    bindings: {
        elementId: '@',
        urlLoad: '@',
        pageTitle: '@',
        service: '@',
        listingKey: '@',
        listingId: '@',
        images: '@',
        openhouses: '@',
        googleApiKey: '@',
        options: '@',
        template: '@',
        defaultListOptions: '@'
    },
    controller(
        $attrs: angular.IAttributes,
        $location: angular.ILocationService,
        $sce: angular.ISCEService,
        $scope: object | any, // angular.IScope breaks references so far
        // tslint:disable-next-line:no-shadowed-variable
        Model: any,
        Idx: any,
    ) {
        // Initialize
        const $ctrl = this
        $ctrl.uid = _.uniqueId(camelToSnake(packageName) + '_' + camelToSnake(moduleName) + '_' + camelToSnake(componentName) + '_')
        Stratus.Instances[$ctrl.uid] = $scope
        $scope.elementId = $attrs.elementId || $ctrl.uid
        Stratus.Internals.CssLoader(`${localDir}${$attrs.template || componentName}.component${min}.css`)

        /**
         * All actions that happen first when the component loads
         * Needs to be placed in a function, as the functions below need to the initialized first
         */
        $ctrl.$onInit = () => {
            $scope.model = new Model() as Model
            $scope.options = $attrs.options && isJSON($attrs.options) ? JSON.parse($attrs.options) : {}
            $scope.options.urlLoad = $attrs.urlLoad && isJSON($attrs.urlLoad) ? JSON.parse($attrs.urlLoad) : true
            $scope.options.pageTitle = $attrs.pageTitle && isJSON($attrs.pageTitle) ? JSON.parse($attrs.pageTitle) : false
            $scope.options.service = $attrs.service && isJSON($attrs.service) ? JSON.parse($attrs.service) : null
            $scope.options.ListingKey = $attrs.listingKey && isJSON($attrs.listingKey) ? JSON.parse($attrs.listingKey) : null
            $scope.options.ListingId = $attrs.listingId && isJSON($attrs.listingId) ? JSON.parse($attrs.listingId) : null
            // Set default images and fields
            $scope.options.images = $attrs.images && isJSON($attrs.images) ? JSON.parse($attrs.images) : {
                fields: [
                    'Order',
                    'MediaURL',
                    'LongDescription'
                ]
            }
            $scope.options.openhouses = $attrs.openhouses && isJSON($attrs.openhouses) ? JSON.parse($attrs.openhouses) : {
                fields: '*'// show all OH details
            }

            $scope.googleApiKey = $attrs.googleApiKey || null

            $scope.defaultListOptions = $attrs.defaultListOptions && isJSON($attrs.defaultListOptions) ?
                JSON.parse($attrs.defaultListOptions) : {}

            $scope.minorDetails = [
                {
                    section: 'Location',
                    items: {
                        // Location fields ignored
                        /*
                        CarrierRoute Field
                        PostalCity Field
                        PostalCodePlus4 Field
                        StreetAdditionalInfo Field
                        StreetDirPrefix Field
                        StreetDirSuffix Field
                        StreetName Field
                        StreetNumber Field
                        StreetNumberNumeric Field
                        StreetSuffix Field
                        StreetSuffixModifier Field
                        UnparsedAddress Field

                        ContinentRegion Field
                        CountryRegion Field
                        MLSAreaMinor Field

                        CrossStreet Field
                        Directions Field
                        Elevation Field
                        ElevationUnits Field
                        Latitude Field
                        Longitude Field
                        MapCoordinate Field
                        MapCoordinateSource Field
                        MapURL Field
                         */
                        UnitNumber: 'Unit',
                        City: 'City',
                        CityRegion: 'City Region',
                        Township: 'Township',
                        CountyOrParish: 'County',
                        MLSAreaMajor: 'Area',
                        SubdivisionName: 'Subdivision',
                        StateOrProvince: 'State',
                        StateRegion: 'State Region',
                        PostalCode: 'Postal Code',
                        Country: 'Country'
                    }
                },
                {
                    section: 'Business',
                    items: {
                        BusinessName: 'Business Name',
                        BusinessType: 'Type',
                        OwnershipType: 'Ownership',
                        SeatingCapacity: {name: 'Seating Capacity', comma: true},
                        YearEstablished: 'Year Established',
                        YearsCurrentOwner: {name: 'Years with Current Owner', comma: true},
                        HoursDaysOfOperation: 'Hours Of Operation',
                        HoursDaysOfOperationDescription: 'Hours Of Operation',
                        NumberOfFullTimeEmployees: {name: 'Full-Time Employees', comma: true},
                        NumberOfPartTimeEmployees: {name: 'Part-Time Employees', comma: true},
                        LaborInformation: 'Labor Info',
                        SpecialLicenses: 'SpecialLicenses',
                        LeaseAmount: {name: 'LeaseAmount', prepend: '$', comma: true},
                        LeaseAmountFrequency: 'Lease Frequency',
                        LeaseAssignableYN: {true: 'Lease Assignable', false: ''},
                        LeaseExpiration: 'Lease Expiration',
                        LeaseRenewalOptionYN: {true: 'Lease Renewable', false: ''}
                    }
                },
                {
                    section: 'Listing',
                    items: {
                        // Characteristics fields ignored
                        /*
                        AnchorsCoTenants
                        LandLeaseAmount Field
                        LandLeaseAmountFrequency Field
                        LandLeaseExpirationDate Field
                        LandLeaseYN Field
                        LeaseTerm Field
                        ParkManagerName Field
                        ParkManagerPhone Field
                        ParkName Field
                        RoadFrontageType Field
                        RoadResponsibility Field
                        RoadSurfaceType Field

                        LotSizeUnits Field
                         */

                        SeniorCommunityYN: {true: 'Senior Community', false: ''},
                        CommunityFeatures: 'Community',
                        CurrentUse: 'Current Use',
                        PossibleUse: 'Possible Uses',

                        LotFeatures: 'Lot Features',
                        LotSizeAcres: {name: 'Lot Size', append: ' Acres', comma: true},
                        LotSizeSquareFeet: {name: 'Lot Size', append: ' SqFt', comma: true},
                        LotSizeArea: {name: 'Lot Size', comma: true},
                        LotSizeDimensions: 'LotSizeDimensions',

                        NumberOfBuildings: {name: 'Number of Buildings', comma: true},
                        NumberOfLots: {name: 'Number of Lots', comma: true},
                        NumberOfPads: {name: 'Number of Pads', comma: true},
                        NumberOfUnitsInCommunity: {name: 'Number of Units In Community', comma: true},
                        NumberOfUnitsTotal: {name: 'Number of Units', comma: true},

                        UnitsFurnished: 'Units Furnished',
                        ViewYN: {true: 'Has a View', false: ''},
                        View: 'View',
                        WaterfrontYN: {true: 'Has a Waterfront', false: ''},
                        WaterfrontFeatures: 'Waterfront',
                        WaterBodyName: 'Body of Water Name'
                    }
                },
                {
                    // last worked on
                    section: 'Farming',
                    items: {
                        // ignored fields
                        // FarmLandAreaUnits Field - string list?
                        CropsIncludedYN: {true: 'Crops Included', false: ''},
                        Vegetation: 'Vegetation',
                        FarmCreditServiceInclYN: {true: 'Farm Credit Service Shares Included', false: ''},
                        GrazingPermitsBlmYN: {true: 'Grazing Permitted - BLM', false: ''},
                        GrazingPermitsForestServiceYN: {true: 'Grazing Permitted - Forestry Service', false: ''},
                        GrazingPermitsPrivateYN: {true: 'Private Grazing Permitted', false: ''},
                        CultivatedArea: {name: 'Cultivated Area', comma: true},
                        PastureArea: {name: 'Pasture Area', comma: true},
                        RangeArea: {name: 'Range Area', comma: true},
                        WoodedArea: {name: 'Wooded Area', comma: true}
                    }
                },
                {
                    section: 'Interior',
                    items: {
                        // fields ignored
                        /*
                        LivingAreaUnits Field
                         */
                        Furnished: 'Furnished',

                        RoomsTotal: '# of Rooms',
                        BedroomsTotal: 'Bedrooms',
                        BedroomsPossible: 'Possible Bedrooms',
                        MainLevelBedrooms: 'Main Bedrooms',

                        BathroomsTotalInteger: 'Total Bathrooms',
                        BathroomsFull: 'Full Bathrooms',
                        BathroomsPartial: 'Partial Bathrooms',
                        BathroomsOneQuarter: '1/4 Bathrooms',
                        BathroomsHalf: 'Half Bathrooms',
                        BathroomsThreeQuarter: '3/4 Bathrooms',
                        MainLevelBathrooms: 'Main Bathrooms',

                        Flooring: 'Flooring',
                        WindowFeatures: 'Windows',
                        DoorFeatures: 'DoorFeatures',

                        LivingArea: {name: 'Living Area', comma: true}, // TODO need make use of another variable

                        FireplaceYN: {true: 'Has Fireplace', false: ''},
                        FireplacesTotal: '# of Fireplaces',
                        FireplaceFeatures: 'Fireplace',
                        InteriorFeatures: 'Interior Features',

                        Appliances: 'Appliances',
                        SecurityFeatures: 'Security',
                        OtherEquipment: 'Equipment'
                    }
                },
                {
                    section: 'Exterior',
                    items: {
                        ExteriorFeatures: 'Exterior',
                        PatioAndPorchFeatures: 'Patio And Porch',
                        Fencing: 'Fencing',
                        Topography: 'Topography',
                        FrontageType: 'Frontage',
                        FrontageLength: 'Frontage Length'
                    }
                },

                {
                    section: 'Amenities',
                    items: {
                        HorseYN: {true: 'Horse Property', false: ''},
                        HorseAmenities: 'Horse Amenities',
                        PoolPrivateYN: {true: 'Has Private Pool', false: ''},
                        PoolFeatures: 'Pool',
                        SpaYN: {true: 'Has Spa', false: ''},
                        SpaFeatures: 'Spa',
                        LaundryFeatures: 'Laundry'
                    }
                },

                {
                    section: 'Heating & Cooling',
                    items: {
                        CoolingYN: {true: 'Has Cooling', false: ''},
                        Cooling: 'Cooling',
                        HeatingYN: {true: 'Has Heating', false: ''},
                        Heating: 'Heating'
                    }
                },
                {
                    section: 'Structure',
                    items: {
                        // ignored fields
                        /*
                        AboveGradeFinishedArea
                        AboveGradeFinishedAreaSource
                        AboveGradeFinishedAreaUnits
                        BelowGradeFinishedArea Field
                        BelowGradeFinishedAreaSource Field
                        BelowGradeFinishedAreaUnits Field
                        DirectionFaces Field
                        EntryLevel Field
                        EntryLocation Field
                        HabitableResidenceYN Field
                        LeasableArea Field
                        LeasableAreaUnits Field
                        BuildingAreaUnits: 'BuildingAreaUnits',
                        MobileDimUnits
                        Performance Group
                        Rooms Group
                        Levels: 'Levels for Sale', // number of levels be sold
                         */
                        NewConstructionYN: {true: 'New Construction', false: ''},
                        DevelopmentStatus: 'Development Status',
                        StructureType: 'Type',
                        ArchitecturalStyle: 'Style',
                        PropertyCondition: 'Condition',
                        PropertyAttachedYN: {true: 'Property Attached to Existing Structure', false: ''},
                        Stories: 'Stories',

                        MobileHomeRemainsYN: {true: 'Mobile Home Remains', false: ''}, // mobile home
                        Make: 'Make', // Mobile houses
                        Model: 'Model', // Mobile houses
                        BodyType: 'Body Type', // Mobile houses
                        MobileLength: {name: 'Mobile Length', comma: true}, // Mobile houses
                        MobileWidth: {name: 'Mobile Width', comma: true}, // Mobile houses

                        BuildingName: 'Building Name',
                        StoriesTotal: 'Complex Stories',
                        BuilderModel: 'Model',
                        BuilderName: 'Builder',

                        YearBuilt: 'Year Built',
                        YearBuiltEffective: 'Year Renovated',
                        YearBuiltDetails: {},

                        CommonWalls: 'Common Walls',
                        BuildingFeatures: 'Building Features',
                        AccessibilityFeatures: 'Accessibility',
                        Basement: 'Basement',
                        Roof: 'Roof',
                        ConstructionMaterials: 'Construction',
                        FoundationDetails: 'Foundation',
                        FoundationArea: 'Foundation',
                        OtherStructures: 'Other Structures',
                        BuildingAreaTotal: {name: 'Building Area', comma: true}, // TODO need make use of another variable

                        DOH1: 'DOH1', // Mobile houses
                        DOH2: 'DOH2', // Mobile houses
                        DOH3: 'DOH3', // Mobile houses
                        License1: 'License', // Mobile houses
                        License2: 'License', // Mobile houses
                        License3: 'License', // Mobile houses
                        RVParkingDimensions: 'RV Parking', // Mobile houses
                        SerialU: 'Serial U', // Mobile houses
                        SerialX: 'Serial X', // Mobile houses
                        SerialXX: 'Serial XX', // Mobile houses
                        Skirt: 'Skirt' // Mobile houses
                    }
                },
                {
                    section: 'Parking',
                    items: {
                        // ignored fields:
                        /*
                        OpenParkingYN Field
                         */
                        ParkingTotal: 'Parking Spaces',
                        GarageYN: {true: 'Has Garage', false: ''},
                        GarageSpaces: '# of Garage Spaces',
                        AttachedGarageYN: {true: 'Attached Garage', false: ''},
                        CarportYN: {true: 'Has Carport', false: ''},
                        CarportSpaces: '# of Carport Spaces',
                        CoveredSpaces: '# of Covered Spaces',
                        OpenParkingSpaces: '# of Open Spaces',
                        OtherParking: 'Other Parking',
                        ParkingFeatures: 'Parking'
                    }
                },
                {
                    section: 'Utilities',
                    items: {
                        // Distances ignored
                        /*
                        DistanceToBusComments Field
                        DistanceToBusNumeric Field
                        DistanceToBusUnits Field
                        DistanceToElectricComments Field
                        DistanceToElectricNumeric Field
                        DistanceToElectricUnits Field
                        DistanceToFreewayComments Field
                        DistanceToFreewayNumeric Field
                        DistanceToFreewayUnits Field
                        DistanceToGasComments Field
                        DistanceToGasNumeric Field
                        DistanceToGasUnits Field
                        DistanceToPhoneServiceComments Field
                        DistanceToPhoneServiceNumeric Field
                        DistanceToPhoneServiceUnits Field
                        DistanceToPlaceofWorshipComments Field
                        DistanceToPlaceofWorshipNumeric Field
                        DistanceToPlaceofWorshipUnits Field
                        DistanceToSchoolBusComments Field
                        DistanceToSchoolBusNumeric Field
                        DistanceToSchoolBusUnits Field
                        DistanceToSchoolsComments Field
                        DistanceToSchoolsNumeric Field
                        DistanceToSchoolsUnits Field
                        DistanceToSewerComments Field
                        DistanceToSewerNumeric Field
                        DistanceToSewerUnits Field
                        DistanceToShoppingComments Field
                        DistanceToShoppingNumeric Field
                        DistanceToShoppingUnits Field
                        DistanceToStreetComments Field
                        DistanceToStreetNumeric Field
                        DistanceToStreetUnits Field
                        DistanceToWaterComments Field
                        DistanceToWaterNumeric Field
                        DistanceToWaterUnits Field
                         */
                        // other ignored
                        /*
                        ElectricOnPropertyYN Field
                        PowerProduction
                         */
                        Utilities: 'Utilities',
                        Electric: 'Electric',
                        WaterSource: 'Water',
                        Sewer: 'Sewer',
                        IrrigationSource: 'IrrigationSource',
                        IrrigationWaterRightsYN: {true: 'Has Irrigation Water Rights', false: ''},
                        IrrigationWaterRightsAcres: {name: 'Irrigation Water Rights', append: ' Acres', comma: true},
                        NumberOfSeparateElectricMeters: {name: 'Number Of Separate Electric Meters', comma: true},
                        NumberOfSeparateGasMeters: {name: 'Number Of Separate Gas Meters', comma: true},
                        NumberOfSeparateWaterMeters: {name: 'Number Of Separate Water Meters', comma: true}
                    }
                },
                {
                    section: 'School',
                    items: {
                        ElementarySchool: 'Elementary School',
                        ElementarySchoolDistrict: 'Elementary School District',
                        MiddleOrJuniorSchool: 'Middle School',
                        MiddleOrJuniorSchoolDistrict: 'Middle School District',
                        HighSchoolt: 'High School',
                        HighSchoolDistrict: 'High School District'
                    }
                },
                {
                    section: 'Contract',
                    items: {
                        // Listing fields ignored
                        /*
                        AgentOffice group
                        Compensation Group
                        Showing Group // see openhouses

                        BuyerFinancing
                        ConcessionsAmount
                        ConcessionsComments Field
                        Concessions Field
                        Possession
                        CurrentFinancing

                        CancelationDate Field
                        CloseDate Field
                        ContingentDate Field
                        ContractStatusChangeDate Field
                        CumulativeDaysOnMarket Field
                        DaysOnMarket Field
                        ExpirationDate Field
                        ListingContractDate Field
                        MajorChangeTimestamp Field
                        MajorChangeType Field
                        ModificationTimestamp Field
                        OffMarketDate Field
                        OffMarketTimestamp Field
                        OnMarketDate Field
                        OnMarketTimestamp Field
                        OriginalEntryTimestamp Field
                        PendingTimestamp Field
                        PriceChangeTimestamp Field
                        PurchaseContractDate Field
                        StatusChangeTimestamp Field
                        WithdrawnDate Field
                        DocumentsChangeTimestamp Field
                        PhotosChangeTimestamp Field
                        VideosChangeTimestamp Field

                        InternetAddressDisplayYN Field
                        InternetAutomatedValuationDisplayYN Field
                        InternetConsumerCommentYN Field
                        InternetEntireListingDisplayYN Field
                        SignOnPropertyYN Field
                        SyndicateTo Field
                        VirtualTourURLBranded Field
                        VirtualTourURLUnbranded Field
                        PhotosCount Field
                        DocumentsCount Field
                        VideosCount Field
                        MlsStatus Field

                        ClosePrice Field
                        ListPrice Field
                        ListPriceLow Field
                        OriginalListPrice Field
                        PreviousListPrice Field
                        PublicRemarks Field
                        SyndicationRemarks Field
                        SourceSystemName Field
                        StandardStatus Field
                         */
                        AvailabilityDate: 'Availability', // todo need to handle dates
                        PetsAllowed: {name: 'PetsAllowed'},
                        HomeWarrantyYN: {true: 'Home Warranty Included', false: ''},
                        LeaseConsideredYN: {true: 'Leasing Considered', false: ''},
                        ListingAgreement: 'Listing Agreement',
                        ListingService: 'Service',
                        DocumentsAvailable: 'Documents Available',
                        Ownership: 'Ownership',
                        Contingencies: 'Contingencies',
                        Disclosures: 'Disclosures',
                        Exclusions: 'Exclusions',
                        Inclusions: 'Inclusions',
                        ListingTerms: 'ListingTerms',
                        SpecialListingConditions: 'Special Listing Conditions',
                        CommonInterest: 'Common Interest',
                        CopyrightNotice: 'Copyright Notice',
                        Disclaimer: 'Disclaimer'
                    }
                },
                {
                    section: 'Financial',
                    items: {
                        // Ignored HOA
                        /*
                        AssociationName Field
                        AssociationName2 Field
                        AssociationPhone Field
                        AssociationPhone2 Field
                        PetsAllowed Field - array
                         */
                        // Ignored Finance
                        /*
                        CapRate Field
                        ExistingLeaseType Field
                        GrossIncome Field
                        GrossScheduledIncome Field
                        IncomeIncludes Field
                        NetOperatingIncome Field
                        NumberOfUnitsLeased Field
                        NumberOfUnitsMoMo Field
                        NumberOfUnitsVacant Field
                        VacancyAllowance Field
                        VacancyAllowanceRate Field
                        TotalActualRent Field
                         */
                        // Ignored Tax
                        /*
                        PublicSurveyRange
                        PublicSurveySection Field
                        PublicSurveyTownship Field
                        TaxBlock
                        TaxLot
                        TaxLegalDescription
                        TaxTract
                        TaxBookNumber
                        TaxMapNumber
                         */
                        RentControlYN: {true: 'Rent Control', false: ''},
                        TenantPays: 'Tenant Pays',
                        OwnerPays: 'Owner Pays',
                        RentIncludes: 'Rent Includes',
                        AssociationYN: {true: 'Has HOA', false: 'No HOA'},
                        AssociationFee: {name: 'HOA Fee', prepend: '$', comma: true},
                        AssociationFeeFrequency: 'HOA Frequency',
                        AssociationFeeIncludes: 'HOA Includes',
                        AssociationFee2: {name: 'Additional HOA Fee', prepend: '$', comma: true},
                        AssociationFeeFrequency2: 'Additional HOA Frequency',
                        CableTvExpense: {name: 'Cable Tv Expense', prepend: '$', comma: true},
                        ElectricExpense: {name: 'Electric Expense', prepend: '$', comma: true},
                        FuelExpense: {name: 'Fuel Expense', prepend: '$', comma: true},
                        FurnitureReplacementExpense: {name: 'Furniture Replacement Expense', prepend: '$', comma: true},
                        GardenerExpense: {name: 'Gardener Expense', prepend: '$', comma: true},
                        InsuranceExpense: {name: 'Insurance Expense', prepend: '$', comma: true},
                        LicensesExpense: {name: 'Licenses Expense', prepend: '$', comma: true},
                        MaintenanceExpense: {name: 'Maintenance Expense', prepend: '$', comma: true},
                        ManagerExpense: {name: 'Manager Expense', prepend: '$', comma: true},
                        NewTaxesExpense: {name: 'New Taxes Expense', prepend: '$', comma: true},
                        OperatingExpense: {name: 'Operating Expense', prepend: '$', comma: true},
                        OperatingExpenseIncludes: 'Operating Expense Includes',
                        OtherExpense: {name: 'Other Expense', prepend: '$', comma: true},
                        PestControlExpense: {name: 'Pest Control Expense', prepend: '$', comma: true},
                        PoolExpense: {name: 'Pool Expense', prepend: '$', comma: true},
                        ProfessionalManagementExpense: {
                            name: 'Professional Management Expense',
                            prepend: '$',
                            comma: true
                        },
                        SuppliesExpense: {name: 'Supplies Expense', prepend: '$', comma: true},
                        TrashExpense: {name: 'Trash Expense', prepend: '$', comma: true},
                        WaterSewerExpense: {name: 'Water Sewer Expense', prepend: '$', comma: true},
                        WorkmansCompensationExpense: {name: 'Workmans Compensation Expense', prepend: '$', comma: true},
                        TaxAnnualAmount: {name: 'Annual Tax', prepend: '$', comma: true},
                        TaxOtherAnnualAssessmentAmount: {name: 'Other Annual Tax', prepend: '$', comma: true},
                        TaxAssessedValue: {name: 'Tax Assessed Value', prepend: '$', comma: true},
                        TaxYear: 'Tax Year Assessed',
                        TaxStatusCurrent: 'Tax Status',
                        TaxParcelLetter: 'Tax Parcel Letter',
                        ParcelNumber: 'Parcel Number',
                        AdditionalParcelsYN: {true: 'Has Additional Prcels', false: ''},
                        AdditionalParcelsDescription: 'Parcels',
                        Zoning: 'Zoning',
                        ZoningDescription: 'Zoning'
                    }
                },
                {
                    section: 'Sources',
                    items: {
                        // ignored fields
                        /*
                         */
                        FinancialDataSource: 'Financial Data',
                        LotSizeSource: 'Lot Size',
                        LotDimensionsSource: 'Lot Dimensions',
                        LivingAreaSource: 'Living Area',
                        BuildingAreaSource: 'Building Area',
                        FarmLandAreaSource: 'Farm Land Area',
                        YearBuiltSource: 'Year Built',
                        MapCoordinateSource: 'Map Coordinate',
                        ListAOR: {name: 'Listing AOR'},
                        OriginatingSystemName: {name: 'Originating System'},
                        OriginatingSystemKey: {name: 'Originating System', prepend: '# '}
                    }
                }
                // Sections not added:
                /*
                UnitTypes Group
                OccupantOwner Group
                 */
            ]

            // Register this List with the Property service
            Idx.registerDetailsInstance($scope.elementId, $scope)
            // console.log(this.uid)

            if (
                $scope.urlLoad !== true &&
                $scope.service &&
                ($scope.ListingKey || $scope.ListingId)
            ) {
                $scope.urlLoad = false
            } else {
                $scope.urlLoad = true
            }

            if ($scope.urlLoad) {
                // Load Options from the provided URL settings
                const urlOptions = Idx.getOptionsFromUrl()
                if (Object.prototype.hasOwnProperty.call(urlOptions, 'Listing')) {
                    _.extend($scope.options, urlOptions.Listing)
                }
            }
            $scope.fetchProperty()
        }

        $scope.$watch('model.data', (data?: any) => {
            if (data) {
                $scope.devLog('Loaded Details Data:', data)
                Idx.setUrlOptions('Listing',
                    {
                        service: $scope.options.service,
                        ListingKey: data.ListingKey,
                        address: $scope.getStreetAddress()
                    })
                Idx.refreshUrlOptions($scope.defaultListOptions)
                if ($scope.options.pageTitle) {
                    // Update the page title
                    Idx.setPageTitle(data.UnparsedAddress)
                }
            }
        })

        $scope.getUid = (): string => $ctrl.uid

        // TODO await until done fetching?
        $scope.fetchProperty = (): void => {
            // FIXME Idx export query Interface
            const propertyQuery: {
                service: number,
                where: {
                    ListingKey?: string,
                    ListingId?: string,
                },
                images?: boolean,
                openhouses?: boolean,
            } = {
                service: $scope.options.service,
                where: {}
            }
            if ($scope.options.ListingKey) {
                propertyQuery.where.ListingKey = $scope.options.ListingKey
            } else if ($scope.options.ListingId) {
                propertyQuery.where.ListingId = $scope.options.ListingId
            }
            if ($scope.options.images) {
                propertyQuery.images = $scope.options.images
            }
            if ($scope.options.openhouses) {
                propertyQuery.openhouses = $scope.options.openhouses
            }
            if (
                !isNaN(propertyQuery.service) &&
                (propertyQuery.where.ListingKey || propertyQuery.where.ListingId)
            ) {
                Idx.fetchProperty($scope, 'model', propertyQuery)
            } else {
                console.error('No Service Id or Listing Key/Id is fetch from')
            }
        }

        $scope.getSlideshowImages = (): { src: string }[] => {
            const images: { src: string }[] = []
            $scope.model.data.Images.forEach((image: { MediaURL?: string }) => {
                // TODO need title/description variables
                if (Object.prototype.hasOwnProperty.call(image, 'MediaURL')) {
                    images.push({src: image.MediaURL})
                }
            })
            return images
        }

        /**
         * Returns the processed street address
         */
        $scope.getStreetAddress = (): string => {
            let address = ''
            if (
                Object.prototype.hasOwnProperty.call($scope.model.data, 'UnparsedAddress') &&
                $scope.model.data.UnparsedAddress !== ''
            ) {
                address = $scope.model.data.UnparsedAddress
            } else {
                const addressParts: string[] = [];
                [
                    'StreetNumberNumeric',
                    'StreetName',
                    'StreetSuffix',
                    'UnitNumber' // Added Unit string?
                ]
                    .forEach(addressPart => {
                        if (Object.prototype.hasOwnProperty.call($scope.model.data, addressPart)) {
                            if (addressPart === 'UnitNumber') {
                                addressParts.push('Unit')
                            }
                            addressParts.push($scope.model.data[addressPart])
                        }
                    })
                address = addressParts.join(' ')
            }
            return address
        }

        $scope.getFullAddress = (encode?: boolean): string => {
            // const address = $scope.model.data.UnparsedAddress + ', ' + $scope.model.data.City + ' ' + $scope.model.data.StateOrProvince
            const address = $scope.getStreetAddress() + ', ' + $scope.model.data.City + ' ' + $scope.model.data.StateOrProvince
            return encode ? encodeURIComponent(address) : address
        }

        $scope.getListAgentName = (): string => $scope.model.data.ListAgentFullName || ($scope.model.data.ListAgentFirstName ?
            $scope.model.data.ListAgentFirstName + ' ' + $scope.model.data.ListAgentLastName : null)

        $scope.getCoListAgentName = (): string => $scope.model.data.CoListAgentFullName || ($scope.model.data.CoListAgentFirstName ?
            $scope.model.data.CoListAgentFirstName + ' ' + $scope.model.data.CoListAgentLastName : null)

        $scope.getBuyerAgentName = (): string => $scope.model.data.BuyerAgentFullName || ($scope.model.data.BuyerAgentFirstName ?
            $scope.model.data.BuyerAgentFirstName + ' ' + $scope.model.data.BuyerAgentLastName : null)

        $scope.getCoBuyerAgentName = (): string => $scope.model.data.CoBuyerAgentFullName || ($scope.model.data.CoBuyerAgentFirstName ?
            $scope.model.data.CoBuyerAgentFirstName + ' ' + $scope.model.data.CoBuyerAgentLastName : null)

        $scope.getGoogleMapEmbedUrl = (): string | null => $scope.googleApiKey ? $sce.trustAsResourceUrl(
            `https://www.google.com/maps/embed/v1/place?key=${$scope.googleApiKey}&q=${$scope.getFullAddress(true)}`
        ) : null

        // FIXME Idx needs to export MLSVariables Interface
        $scope.getMLSVariables = (): MLSService => {
            if (!$ctrl.mlsVariables) {
                $ctrl.mlsVariables = Idx.getMLSVariables([$scope.model.data._ServiceId])
            }
            return $ctrl.mlsVariables[$scope.model.data._ServiceId]
        }

        /**
         * Display an MLS' Name
         */
        $scope.getMLSName = (): string => $scope.getMLSVariables().name

        /**
         * Process an MLS' required legal disclaimer to later display
         * @param html - if output should be HTML safe
         */
        $scope.processMLSDisclaimer = (html?: boolean): string => {
            let disclaimer = $scope.getMLSVariables().disclaimer

            if ($scope.model.data.ModificationTimestamp) {
                disclaimer = `Listing last updated ${moment($scope.model.data.ModificationTimestamp).format('M/D/YY HH:mm a')}. ${disclaimer}`
            }
            if ($scope.model.meta.data.fetchDate) {
                disclaimer = `Last checked ${moment($scope.model.meta.data.fetchDate).format('M/D/YY')}. ${disclaimer}`
            }

            return html ? $sce.trustAsHtml(disclaimer) : disclaimer
        }

        /**
         * Display an MLS' required legal disclaimer
         * @param html - if output should be HTML safe
         */
        $scope.getMLSDisclaimer = (html?: boolean): string => {
            if (!$ctrl.disclaimerHTML) {
                $ctrl.disclaimerHTML = $scope.processMLSDisclaimer(true)
            }
            if (!$ctrl.disclaimerString) {
                $ctrl.disclaimerString = $scope.processMLSDisclaimer(false)
            }
            return html ? $ctrl.disclaimerHTML : $ctrl.disclaimerString
        }

        /**
         * Function that runs when widget is destroyed
         */
        $scope.remove = (): void => {
        }

        /**
         * Output console if not in production
         */
        $scope.devLog = (item1: any, item2: any): void => {
            if (!Stratus.Environment.get('production')) {
                console.log(item1, item2)
            }
        }
    },
    templateUrl: ($attrs: angular.IAttributes): string => `${localDir}${$attrs.template || componentName}.component${min}.html`
}