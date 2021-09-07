import React, { useContext, useState, useEffect, useRef } from 'react'
import { MyContext } from '../contexts/MyContext'
import 'bootstrap/dist/css/bootstrap.min.css';

// Importing the Login & Register Componet
import Login from './Login'
import Register from './Register'
import logo from "../images/logo.jpeg"

/* Openlayers */
import Map from 'ol/Map'
import BingMaps from 'ol/source/BingMaps';
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import { OSM, XYZ } from 'ol/source';
import { defaults as defaultControls } from 'ol/control';
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import {
    Icon,
    Circle as CircleStyle,
    Fill,
    RegularShape,
    Stroke,
    Style,
    Text,
} from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';
import * as olExtent from 'ol/extent';
import { Select, Draw, Modify } from "ol/interaction/";
import tileGrid from "ol/tilegrid/TileGrid";
import proj4 from 'proj4';
import { get as getProjection } from 'ol/proj';
import { register } from 'ol/proj/proj4';
import LayerGroup from 'ol/layer/Group';
import { tile as tileStrategy } from 'ol/loadingstrategy';
import { LineString, Point } from 'ol/geom';
import { getArea, getLength } from 'ol/sphere';
import MVT from "ol/format/MVT";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorTileSource from "ol/source/VectorTile";
import mbStyleFunction from 'ol-mapbox-style/dist/stylefunction';
import * as olProj from 'ol/proj';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import TileWMS from 'ol/source/TileWMS';
import { altKeyOnly, click, pointerMove } from 'ol/events/condition';
import $ from "jquery";

/* ol-ext */
import SearchNominatim from "ol-ext/control/SearchNominatim";
import LayerSwitcher from "ol-ext/control/LayerSwitcher";
import Overview from "ol-ext/control/Overview";
import pb from 'ol-ext/control/ProgressBar';
import Overlay from "ol-ext/control/Overlay";
import Popup from "ol-ext/overlay/Popup";
import Tooltip from "ol-ext/overlay/Tooltip";
import Placemark from "ol-ext/overlay/Placemark";
import Toggle from "ol-ext/control/Toggle";
import ext_Select from "ol-ext/control/Select";
import Scale from "ol-ext/control/Scale";
import ext_Drag from "ol-ext/interaction/DragOverlay";
import GeolocationButton from "ol-ext/control/GeolocationButton";

/* Stylesheets */
import 'ol/ol.css';
import 'ol-ext/dist/ol-ext.css'
import './style.css'

var mapboxKey = "pk.eyJ1IjoiZGh5ZmIiLCJhIjoiY2o4M3F6MzJpMDBoejMybXBhZGF4aXJjOCJ9.rqAE8kSRfPbAdypH3Ydx-g";

proj4.defs("EPSG:31700", "+proj=sterea +lat_0=46 +lon_0=25 +k=0.99975 +x_0=500000 +y_0=500000 +ellps=krass +units=m +no_defs");
register(proj4);

const proj31700 = getProjection('EPSG:31700');
let sLayer;
let layers = [];
let basemaps;
let draw;
let initialMap;
let zoom = 13;
let center = olProj.fromLonLat([27.0336212, 46.3428481], proj31700);
let rotation = 0;
let selectedBaseMap;
let setselectedFeature = [];

const layersStyle = function (e) {
    if (e.getId().indexOf("borne_estimate") !== -1) {
        return new Style({
            image: new Icon({
                src: './icons/1.png',
                scale: [0.05, 0.05],
            })
        })
    }
    if (e.getId().indexOf("borne_existente") !== -1) {
        return new Style({
            image: new Icon({
                src: './icons/2.png',
                scale: [0.05, 0.05],
            })
        })
    }
    if (e.getId().indexOf("indicatoare_rutiere") !== -1) {
        return new Style({
            image: new Icon({
                src: './icons/3.png',
                scale: [0.05, 0.05],
            })
        })
    }
    if (e.getId().indexOf("intersectii_cfr") !== -1) {
        return new Style({
            image: new Icon({
                src: './icons/4.png',
                scale: [0.05, 0.05],
            })
        })
    }
    if (e.getId().indexOf("intersectii_dr") !== -1) {
        return new Style({
            image: new Icon({
                src: './icons/5.png',
                scale: [0.05, 0.05],
            })
        })
    }
    if (e.getId().indexOf("podete") !== -1) {
        return new Style({
            image: new Icon({
                src: './icons/6.png',
                scale: [0.05, 0.05],
            })
        })
    }
}

const hoverStyle = function (e) {
    try {
        if (setselectedFeature.length > 0) {
            if (setselectedFeature[0].getId() == e.getId())
                return [
                    new Style({
                        stroke: new Stroke({
                            color: [255, 255, 255, 1],
                            width: 4,
                            lineDash: [4, 8],
                            lineDashOffset: 6
                        })
                    }),
                    new Style({
                        stroke: new Stroke({
                            color: [255, 0, 0, 1],
                            width: 4,
                            lineDash: [10, 14]
                        })
                    }),
                    new Style({
                        text: new Text({
                            text: e.get('plan_'),
                            font: 'bold 14px Calibri',
                            overflow: true,
                            fill: new Fill({
                                color: '#000',
                            }),
                            stroke: new Stroke({
                                color: '#fff',
                                width: 5,
                            }),
                        }),
                    })
                ]
            else
                return new Style({
                    stroke: new Stroke({
                        color: "red",
                        width: 2
                    }),
                    text: new Text({
                        text: e.get('plan_'),
                        font: 'bold 14px Calibri',
                        overflow: true,
                        fill: new Fill({
                            color: '#fff',
                        }),
                        stroke: new Stroke({
                            color: '#000',
                            width: 5,
                        }),
                    }),
                })
        }
        else
            return new Style({
                stroke: new Stroke({
                    color: "red",
                    width: 2
                }),
                text: new Text({
                    text: e.get('plan_'),
                    font: 'bold 14px Calibri',
                    overflow: true,
                    fill: new Fill({
                        color: '#fff',
                    }),
                    stroke: new Stroke({
                        color: '#000',
                        width: 5,
                    }),
                }),
            })
        // }
        // }
    } catch (e) { }
}

const clickStyle = function (e) {
    try {
        if (e.getId().indexOf("boundaries") !== -1) {
            return [
                new Style({
                    stroke: new Stroke({
                        color: [255, 255, 255, 1],
                        width: 4,
                        lineDash: [4, 8],
                        lineDashOffset: 6
                    })
                }),
                new Style({
                    stroke: new Stroke({
                        color: [255, 0, 0, 1],
                        width: 4,
                        lineDash: [10, 14]
                    })
                }),
                new Style({
                    text: new Text({
                        text: e.get('plan_'),
                        font: 'bold 14px Calibri',
                        overflow: true,
                        fill: new Fill({
                            color: '#000',
                        }),
                        stroke: new Stroke({
                            color: '#fff',
                            width: 5,
                        }),
                    }),
                })
            ]
        }
    } catch (e) { }
}

let acostamente = new VectorLayer({
    title: "Acostamente",
    visible: false,
    source: new VectorSource({
        format: new GeoJSON(),
        url: '../AdminApi/wfs.php?layername=acostamente',
        strategy: bboxStrategy,
    }),
    style: new Style({
        // fill: new Fill({
        //     color: 'rgba(255, 255, 255, 0.5)',
        // }),
        stroke: new Stroke({
            color: '#ffcc33',
            width: 2,
        })
    })
}), anexe_and = new VectorLayer({
    title: "Anexe And",
    visible: false,
    source: new VectorSource({
        format: new GeoJSON(),
        url: '../AdminApi/wfs.php?layername=anexe_and',
        strategy: bboxStrategy,
    }),
    style: new Style({
        fill: new Fill({
            color: 'rgba(255, 255, 255, 0.5)',
        }),
        stroke: new Stroke({
            color: '#ff5599',
            width: 2,
        })
    })
}), borne_estimate = new VectorLayer({
    title: "Borne Estimate",
    visible: false,
    source: new VectorSource({
        format: new GeoJSON(),
        url: '../AdminApi/wfs.php?layername=borne_estimate',
        strategy: bboxStrategy,
    }),
    style: layersStyle
}), borne_existente = new VectorLayer({
    title: "Borne Existente",
    visible: false,
    source: new VectorSource({
        format: new GeoJSON(),
        url: '../AdminApi/wfs.php?layername=borne_existente',
        strategy: bboxStrategy,
    }),
    style: layersStyle
}), imbracaminte_drum = new VectorLayer({
    title: "Imbracaminte Drum",
    visible: false,
    source: new VectorSource({
        format: new GeoJSON(),
        url: '../AdminApi/wfs.php?layername=imbracaminte_drum',
        strategy: bboxStrategy,
    }),
    style: new Style({
        // fill: new Fill({
        //     color: 'rgba(255, 255, 255, 0.5)',
        // }),
        stroke: new Stroke({
            color: '#ff0011',
            width: 2,
        })
    })
}), indicatoare_rutiere = new VectorLayer({
    title: "Indicatoare Rutiere",
    visible: false,
    source: new VectorSource({
        format: new GeoJSON(),
        url: '../AdminApi/wfs.php?layername=indicatoare_rutiere',
        strategy: bboxStrategy,
    }),
    style: layersStyle
}), intersectii_cfr = new VectorLayer({
    title: "Intersectii Cfr",
    visible: false,
    source: new VectorSource({
        format: new GeoJSON(),
        url: '../AdminApi/wfs.php?layername=intersectii_cfr',
        strategy: bboxStrategy,
    }),
    style: layersStyle
}), intersectii_dr = new VectorLayer({
    title: "Intersectii Dr",
    visible: false,
    source: new VectorSource({
        format: new GeoJSON(),
        url: '../AdminApi/wfs.php?layername=intersectii_dr',
        strategy: bboxStrategy,
    }),
    style: layersStyle
}), limite_pug_bacau = new VectorLayer({
    title: "Limite Pug Bacau",
    visible: false,
    source: new VectorSource({
        format: new GeoJSON(),
        url: '../AdminApi/wfs.php?layername=limite_pug_bacau',
        strategy: bboxStrategy,
    }),
    style: new Style({
        fill: new Fill({
            color: 'rgba(255, 255, 255, 0.5)',
        }),
        stroke: new Stroke({
            color: '#f0f0f0',
            width: 2,
        })
    })
}), limite_uat_bacau = new VectorLayer({
    title: "Limite Uat Bacau",
    visible: false,
    source: new VectorSource({
        format: new GeoJSON(),
        url: '../AdminApi/wfs.php?layername=limite_uat_bacau',
        strategy: bboxStrategy,
    }),
    style: new Style({
        fill: new Fill({
            color: 'rgba(255, 255, 255, 0.5)',
        }),
        stroke: new Stroke({
            color: '#0f0f0f',
            width: 2,
        })
    })
}), localitati_traversate = new VectorLayer({
    title: "Localitati Traversate",
    visible: false,
    source: new VectorSource({
        format: new GeoJSON(),
        url: '../AdminApi/wfs.php?layername=localitati_traversate',
        strategy: bboxStrategy,
    }),
    style: new Style({
        // fill: new Fill({
        //     color: 'rgba(255, 255, 255, 0.5)',
        // }),
        stroke: new Stroke({
            color: '#ff00ff',
            width: 2,
        })
    })
}), parapete = new VectorLayer({
    title: "Parapete",
    visible: false,
    source: new VectorSource({
        format: new GeoJSON(),
        url: '../AdminApi/wfs.php?layername=parapete',
        strategy: bboxStrategy,
    }),
    style: new Style({
        // fill: new Fill({
        //     color: 'rgba(255, 255, 255, 0.5)',
        // }),
        stroke: new Stroke({
            color: '#00ffff',
            width: 2,
        })
    })
}), podete = new VectorLayer({
    title: "Podete",
    visible: false,
    source: new VectorSource({
        format: new GeoJSON(),
        url: '../AdminApi/wfs.php?layername=podete',
        strategy: bboxStrategy,
    }),
    style: layersStyle
}), poduri_ = new VectorLayer({
    title: "Poduri_",
    visible: false,
    source: new VectorSource({
        format: new GeoJSON(),
        url: '../AdminApi/wfs.php?layername=poduri_',
        strategy: bboxStrategy,
    }),
    style: new Style({
        fill: new Fill({
            color: 'rgba(255, 255, 255, 0.5)',
        }),
        stroke: new Stroke({
            color: '#ffff00',
            width: 2,
        })
    })
}), santuri = new VectorLayer({
    title: "Santuri",
    visible: false,
    source: new VectorSource({
        format: new GeoJSON(),
        url: '../AdminApi/wfs.php?layername=santuri',
        strategy: bboxStrategy,
    }),
    style: new Style({
        // fill: new Fill({
        //     color: 'rgba(255, 255, 255, 0.5)',
        // }),
        stroke: new Stroke({
            color: '#ff0000',
            width: 2,
        })
    })
}), traseu_info = new VectorLayer({
    title: "Traseu Info",
    visible: false,
    source: new VectorSource({
        format: new GeoJSON(),
        url: '../AdminApi/wfs.php?layername=traseu_info',
        strategy: bboxStrategy,
    }),
    style: new Style({
        // fill: new Fill({
        //     color: 'rgba(255, 255, 255, 0.5)',
        // }),
        stroke: new Stroke({
            color: '#00ff00',
            width: 2,
        })
    })
}), zid_sprijin = new VectorLayer({
    title: "Zid Sprijin",
    visible: false,
    source: new VectorSource({
        format: new GeoJSON(),
        url: '../AdminApi/wfs.php?layername=zid_sprijin',
        strategy: bboxStrategy,
    }),
    style: new Style({
        // fill: new Fill({
        //     color: 'rgba(255, 255, 255, 0.5)',
        // }),
        stroke: new Stroke({
            color: '#0000ff',
            width: 2,
        })
    })
});

const style = new Style({
    fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)',
    }),
    stroke: new Stroke({
        color: 'rgba(255, 204, 51, 1)',
        lineDash: [10, 10],
        width: 2,
    }),
    image: new CircleStyle({
        radius: 5,
        stroke: new Stroke({
            color: 'rgba(0, 0, 0, 0.7)',
        }),
        fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)',
        }),
    }),
});

const labelStyle = new Style({
    text: new Text({
        font: '14px Calibri',
        fill: new Fill({
            color: 'rgba(255, 255, 255, 1)',
        }),
        backgroundFill: new Fill({
            color: 'rgba(0, 0, 0, 0.7)',
        }),
        padding: [3, 3, 3, 3],
        textBaseline: 'bottom',
        offsetY: -15,
    }),
    image: new RegularShape({
        radius: 8,
        points: 3,
        angle: Math.PI,
        displacement: [0, 10],
        fill: new Fill({
            color: 'rgba(0, 0, 0, 0.7)',
        }),
    }),
});

const tipStyle = new Style({
    text: new Text({
        font: '12px Calibri',
        fill: new Fill({
            color: 'rgba(255, 255, 255, 1)',
        }),
        backgroundFill: new Fill({
            color: 'rgba(0, 0, 0, 0.8)',
        }),
        padding: [2, 2, 2, 2],
        textAlign: 'left',
        offsetX: 15,
    }),
});

const modifyStyle = new Style({
    image: new CircleStyle({
        radius: 5,
        stroke: new Stroke({
            color: 'rgba(0, 0, 0, 0.7)',
        }),
        fill: new Fill({
            color: 'rgba(0, 0, 0, 0.4)',
        }),
    }),
    text: new Text({
        text: 'Drag to modify',
        font: '12px Calibri',
        fill: new Fill({
            color: 'rgba(255, 255, 255, 1)',
        }),
        backgroundFill: new Fill({
            color: 'rgba(0, 0, 0, 0.7)',
        }),
        padding: [2, 2, 2, 2],
        textAlign: 'left',
        offsetX: 15,
    }),
});

const segmentStyle = new Style({
    text: new Text({
        font: '12px Calibri',
        fill: new Fill({
            color: 'rgba(255, 255, 255, 1)',
        }),
        backgroundFill: new Fill({
            color: 'rgba(255, 204, 51, 1)',
        }),
        padding: [2, 2, 2, 2],
        textBaseline: 'bottom',
        offsetY: -12,
    }),
    image: new RegularShape({
        radius: 6,
        points: 3,
        angle: Math.PI,
        displacement: [0, 8],
        fill: new Fill({
            color: 'rgba(0, 0, 0, 0.4)',
        }),
    }),
});

const segmentStyles = [segmentStyle];

const formatLength = function (line) {
    const length = getLength(line);
    let output;
    if (length > 100) {
        output = Math.round((length / 1000) * 100) / 100 + ' km';
    } else {
        output = Math.round(length * 100) / 100 + ' m';
    }
    return output;
};

const formatArea = function (polygon) {
    const area = getArea(polygon);
    let output;
    if (area > 10000) {
        output = Math.round((area / 1000000) * 100) / 100 + ' km\xB2';
    } else {
        output = Math.round(area * 100) / 100 + ' m\xB2';
    }
    return output;
};

const drawSource = new VectorSource();

const modify = new Modify({ source: drawSource, style: modifyStyle });

let tipPoint;

function styleFunction(feature, segments, drawType, tip) {
    const styles = [style];
    const geometry = feature.getGeometry();
    const type = geometry.getType();
    let point, label, line;
    if (!drawType || drawType === type) {
        if (type === 'Polygon') {
            point = geometry.getInteriorPoint();
            label = formatArea(geometry);
            line = new LineString(geometry.getCoordinates()[0]);
        } else if (type === 'LineString') {
            point = new Point(geometry.getLastCoordinate());
            label = formatLength(geometry);
            line = geometry;
        }
    }

    if (segments && line) {
        let count = 0;
        line.forEachSegment(function (a, b) {
            const segment = new LineString([a, b]);
            const label = formatLength(segment);
            if (segmentStyles.length - 1 < count) {
                segmentStyles.push(segmentStyle.clone());
            }
            const segmentPoint = new Point(segment.getCoordinateAt(0.5));
            segmentStyles[count].setGeometry(segmentPoint);
            segmentStyles[count].getText().setText(label);
            styles.push(segmentStyles[count]);
            count++;
        });
    }

    if (label) {
        labelStyle.setGeometry(point);
        labelStyle.getText().setText(label);
        styles.push(labelStyle);
    }

    if (tip && type === 'Point' && !modify.getOverlay().getSource().getFeatures().length) {
        tipPoint = geometry;
        tipStyle.getText().setText(tip);
        styles.push(tipStyle);
    }
    return styles;
}

const drawLayer = new VectorLayer({
    title: 'Drawing',
    displayInLayerSwitcher: false,
    source: drawSource,
    style: function (feature) {
        return styleFunction(feature, true);
    },
});

function Home() {
    const [map, setMap] = useState()
    const { rootState, logoutUser } = useContext(MyContext);
    const { isAuth, theUser, showLogin } = rootState;


    const mapElement = useRef()
    const mapRef = useRef()
    mapRef.current = map

    useEffect(() => {
        console.log('load now');
        layers = new LayerGroup({
            title: 'Datasets',
            openInLayerSwitcher: false,
            layers: [
                zid_sprijin,
                traseu_info,
                santuri,
                poduri_,
                podete,
                parapete,
                localitati_traversate,
                limite_uat_bacau,
                limite_pug_bacau,
                intersectii_dr,
                intersectii_cfr,
                indicatoare_rutiere,
                imbracaminte_drum,
                borne_existente,
                borne_estimate,
                anexe_and,
                acostamente
            ]
        })

        basemaps = new LayerGroup({
            title: 'Basemaps',
            openInLayerSwitcher: true,
            layers: [
                new TileLayer({
                    baseLayer: true,
                    title: "OSM",
                    visible: true,
                    source: new OSM()
                }),
                new TileLayer({
                    baseLayer: true,
                    title: "ESRI",
                    visible: false,
                    source: new XYZ({
                        attributions: ['Powered by Esri',
                            'Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'],
                        attributionsCollapsible: true,
                        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                        maxZoom: 16
                    }),
                })
            ]
        });
        layers = [
            basemaps,
            layers,
            drawLayer,
        ];

        if (window.location.hash !== '') {
            // try to restore center, zoom-level and rotation from the URL
            const hash = window.location.hash.replace('#map=', '');
            const parts = hash.split('/');
            if (parts.length === 4) {
                zoom = parseFloat(parts[0]);
                center = [parseFloat(parts[1]), parseFloat(parts[2])];
                rotation = parseFloat(parts[3]);
            }
        }

        initialMap = new Map({
            target: mapElement.current,
            layers: layers,
            view: new View({
                projection: proj31700,
                center: center,
                zoom: zoom
            }),
            controls: defaultControls().extend([]),
        })

        setMap(initialMap);

        initialMap.on("pointermove", function (evt) {
            var hit = this.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
                return true;
            });
            if (hit) {
                this.getTargetElement().style.cursor = 'pointer';
            } else {
                this.getTargetElement().style.cursor = '';
            }
        });

        let shouldUpdate = true;
        const view = initialMap.getView();
        const updatePermalink = function () {
            if (!shouldUpdate) {
                // do not update the URL when the view was changed in the 'popstate' handler
                shouldUpdate = true;
                return;
            }

            const center = view.getCenter();
            const hash =
                '#map=' +
                view.getZoom().toFixed(2) +
                '/' +
                center[0].toFixed(2) +
                '/' +
                center[1].toFixed(2) +
                '/' +
                view.getRotation();
            const state = {
                zoom: view.getZoom(),
                center: view.getCenter(),
                rotation: view.getRotation(),
            };
            window.history.pushState(state, 'map', hash);
        };

        initialMap.on('moveend', updatePermalink);

        window.addEventListener('popstate', function (event) {
            if (event.state === null) {
                return;
            }
            initialMap.getView().setCenter(event.state.center);
            initialMap.getView().setZoom(event.state.zoom);
            initialMap.getView().setRotation(event.state.rotation);
            shouldUpdate = false;
        });

        // initialMap.on('click', handleMapClick)


        // myModule.createGPS(initialMap);
        myModule.createLayerSwitcher(initialMap);
        // myModule.createOverview(initialMap);
        myModule.createScale(initialMap);
        // myModule.createSearch(initialMap);
        // myModule.createSideMenu(initialMap);
        myModule.createProgressBar(initialMap);
        // myModule.createCustomButtons(initialMap);
        // myModule.createHoverAndSelect(initialMap);
    }, [isAuth])

    // If user Logged in
    if (isAuth) {
        return (
            <>
                <div className="maincontainer">
                    <nav className="navbar navbar-expand-md navbar-light bg-primary">
                        <img width={30} height={30} src={logo} alt="logo" />
                        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarNav">
                            {/* <ul className="nav navbar-nav ml-auto">
                                <li className="nav-item active">
                                    <a className="nav-link" href="#">Home <span className="sr-only">(current)</span></a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="#">Features</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="#">Pricing</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link disabled" href="#">Disabled</a>
                                </li>
                            </ul> */}
                        </div>

                        <div className="justify-content-center" id="navbarNavDropdown">
                            <div className="navbar-nav ml-auto text-white">
                                Weclome {theUser.name},&nbsp;
                                <i className="fa fa-sign-out" onClick={logoutUser} style={{ marginTop: "5px", cursor: "pointer" }}></i>
                            </div>
                        </div>
                    </nav>
                    <div className="container">
                        <div id="map" ref={mapElement} style={{ width: "100vw", height: "100vh", left: 0, position: 'fixed' }}>
                        </div>
                        {/* <div className="userInfo">
                            <div className="_img"><span role="img" aria-label="User Image">👦</span></div>
                            <h1>{theUser.name}</h1>
                            <div className="_email"><span>{theUser.email}</span></div>
                        </div> */}
                    </div>
                </div>
                <div style={{ position: 'absolute', bottom: 0, width: "100vw", textAlign: 'center', background: "#0D6EFD", color: "white", padding: "3px" }}>
                    © Copyright 2021-2022
                </div>
            </>
        )
    }
    // Showing Login Or Register Page According to the condition
    else if (showLogin) {
        return <Login />;
    }
    else {
        return <Register />;
    }

}

export default Home;

let myModule = {
    createSearch: function (map) {
        let search = new SearchNominatim({
            polygon: true,
            reverse: false,
            position: true
        });
        map.addControl(search);

        search.on('select', function (e) {
            sLayer.getSource().clear();
            if (e.search.geojson) {
                var format = new GeoJSON();
                var f = format.readFeature(e.search.geojson, { dataProjection: "EPSG:4326", featureProjection: map.getView().getProjection() });
                sLayer.getSource().addFeature(f);
                var view = map.getView();
                var resolution = view.getResolutionForExtent(f.getGeometry().getExtent(), map.getSize());
                var zoom = view.getZoomForResolution(resolution);
                var center = olExtent.getCenter(f.getGeometry().getExtent());
                // redraw before zoom
                setTimeout(function () {
                    view.animate({
                        center: center,
                        zoom: Math.min(zoom, 16)
                    });
                }, 100);
            }
            else {
                map.getView().animate({
                    center: e.coordinate,
                    zoom: Math.max(map.getView().getZoom(), 16)
                });
            }
        });
    },
    createSideMenu: function (map) {
        let sideMenu = new Overlay({
            closeBox: true,
            className: "slide-left menu",
            content: $("#menu").get(0)
        });
        map.addControl(sideMenu);

        // A toggle control to show/hide the menu
        var t = new Toggle(
            {
                html: '<i class="fa fa-bars" ></i>',
                className: "menu",
                title: "Menu",
                onToggle: function () { sideMenu.toggle(); }
            });
        map.addControl(t);
    },
    createCustomButtons: function (map) {
        // var selectCtrl = new Toggle(
        //     {
        //         // html: $("#length").get(0),
        //         // className: "select",
        //         title: "Select",
        //         interaction: new Select(),
        //         active: true,
        //         onToggle: function (active) {
        //             $("#info").text("Select is " + (active ? "activated" : "deactivated"));
        //         }
        //     });
        // var pedit = new Toggle(
        //     {
        //         html: $("#area").get(0),
        //         className: "edit",
        //         title: 'Point',
        //         interaction: new Draw
        //             ({
        //                 type: 'Point',
        //                 // source: vector.getSource()
        //             }),
        //         onToggle: function (active) {
        //             $("#info").text("Edition is " + (active ? "activated" : "deactivated"));
        //         }
        //     });
        // map.addControl(pedit);
        // map.addControl(selectCtrl);
    },
    createOverview: function (map) {
        let overview = new Overview({
            projection: "EPSG:4326",
            layers: [new TileLayer({ source: new OSM() })]
        });
        map.addControl(overview);
    },
    createScale: function (map) {
        let scale = new Scale({ editable: false });
        map.addControl(scale);
    },
    createHoverAndSelect: function (map) {
        const hoverCtrl = new Select({
            condition: pointerMove,
            style: hoverStyle
        });
        const selectCtrl = new Select({
            condition: click,
            style: clickStyle
        });
        map.addInteraction(hoverCtrl);
        map.addInteraction(selectCtrl);


        selectCtrl.on('select', function (e) {
            // console.log(e.selected);
            setselectedFeature = [];
            setselectedFeature.push(e.selected[0]);
        });
    },
    createProgressBar: function (map) {
        // console.log(basemaps.getLayers().array_);
        let progressBar = new pb({
            label: '...',
            layers: basemaps.getLayers().array_
        });
        map.addControl(progressBar);
    },
    createGPS: function (map) {
        let gps = new GeolocationButton({
            title: 'Where am I?',
            delay: 2000
        });
        map.addControl(gps);


        // Show position
        var here = new Popup({ positioning: 'bottom-center' });
        map.addOverlay(here);
        gps.on('position', function (e) {
            if (e.coordinate) here.show(e.coordinate, "You are<br/>here!");
            else here.hide();
        });
    },
    createLayerSwitcher: function (map) {
        let switcher = new LayerSwitcher({
            // oninfo: function (l) {
            //     $('.options').html(l.get('title') + '<br/>');
            //     switch (l.get('title')) {
            //         case 'GEOLOGIE':
            //             $('<img>').appendTo($('.options'))
            //                 .attr('src', 'http://geoservices.brgm.fr/geologie?language=fre&version=1.3.0&service=WMS&request=GetLegendGraphic&sld_version=1.1.0&layer=GEOSERVICES_GEOLOGIE&format=image/png&STYLE=default');
            //             break;
            //         default:
            //             break;
            //     }
            // },
            target: $(".menu-switcher").get(0)
        });
        map.addControl(switcher);

        switcher.on('drawlist', (e) => {
            var layer = e.layer;
            e.li.querySelector('label').addEventListener('click', () => {
                // console.log(layer.getVisible());
                selectedBaseMap = layer.get('title');
                // if (selectedBaseMap == "Properties Boundaries")
                //     santuriWMS.setVisible(layer.getVisible());
                // if (selectedBaseMap == "Zoning")
                //     addLegendContent('<div id="zoning"><table><tr><td><a id="statesImg" onclick="' + removeLayer('zoning') + '"><img height="15px" width="15px" src="' + remove + '"></a></td><td><input type="checkbox" id="' + selectedBaseMap + '" onchange="' + handlelegend('zoning') + '" checked/></td><td><h3>' + selectedBaseMap + '</h3></td></tr><tr><td><div style="background-color: #FEDAE4; height: 15px; width: 15px; border: 1px solid black;" /></td><td>LDR - Low density residential</td></tr><tr><td><div style="background-color: #EDAFE0; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>CR1 - Character</td></tr><tr><td><div style="background-color: #EDAFE0; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>CR2 - Infill housing</td></tr><tr><td><div style="background-color: #EDAFE0; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>LMR1 - Low-medium density residential (2 storey mix)</td></tr><tr><td><div style="background-color: #EDAFE0; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>LMR2 - Low-medium density residential (2 or 3 storey mix)</td></tr><tr><td><div style="background-color: #EDAFE0; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>LMR3 - Low-medium density residential (Up to 3 storeys)</td></tr><tr><td><div style="background-color: #F76677; height: 15px; width: 15px; border: 1px solid black;" /></td><td>MDR - Medium density residential</td></tr><tr><td><div style="background-color: #A30001; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>HDR1 - High density residential (Up to 8 storeys)</td></tr><tr><td><div style="background-color: #A30001; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>HDR2 - High density residential (Up to 15 storeys)</td></tr><tr><td><div style="background-color: #FF4A28; height: 15px; width: 15px; border: 1px solid black;" /></td><td>TA - Tourist accommodation</td></tr><tr><td><div style="background-color: #CDE4FF; height: 15px; width: 15px; border: 1px solid black;" /></td><td>NC - Neighbourhood centre</td></tr><tr><td><div style="background-color: #6C7CAD; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>DC1 - District</td></tr><tr><td><div style="background-color: #6C7CAD; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>DC2 - Corridor</td></tr><tr><td><div style="background-color: #4670F6; height: 15px; width: 15px; border: 1px solid black;" /></td><td>MC - Major centre</td></tr><tr><td><div style="background-color: #0D31FF; height: 15px; width: 15px; border: 1px solid black;" /></td><td>PC1 - Principal centre (City centre)</td></tr><tr><td><div style="background-color: #0D31FF; height: 15px; width: 15px; border: 1px solid black;" /></td><td>PC2 - Principal centre (Regional centre)</td></tr><tr><td><div style="background-color: #E6C8D4; height: 15px; width: 15px; border: 1px solid black;" /></td><td>LII - Low impact industry</td></tr><tr><td><div style="background-color: #C2A9ED; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>IN1 - General industry A</td></tr><tr><td><div style="background-color: #C2A9ED; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>IN2 - General industry B</td></tr><tr><td><div style="background-color: #C2A9ED; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>IN3 - General industry C</td></tr><tr><td><div style="background-color: #922590; height: 15px; width: 15px; border: 1px solid black;" /></td><td>SI - Special industry</td></tr><tr><td><div style="background-color: #C6B0DE; height: 15px; width: 15px; border: 1px solid black;" /></td><td>II - Industry investigation</td></tr><tr><td><div style="background-color: #A8E4CB; height: 15px; width: 15px; border: 1px solid black;" /></td><td>SR - Sport and recreation</td></tr><tr><td><div style="background-color: #B5D9E9; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>SR1 - Sport and recreation (Local)</td></tr><tr><td><div style="background-color: #B5D9E9; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>SR2 - Sport and recreation (District)</td></tr><tr><td><div style="background-color: #B5D9E9; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>SR3 - Sport and recreation (Metropolitan)</td></tr><tr><td><div style="background-color: #6DAB62; height: 15px; width: 15px; border: 1px solid black;" /></td><td>OS - Open space</td></tr><tr><td><div style="background-color: #66B04F; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>OS1 - Open space (Local)</td></tr><tr><td><div style="background-color: #66B04F; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>OS2 - Open space (District)</td></tr><tr><td><div style="background-color: #66B04F; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>OS3 - Open space (Metropolitan)</td></tr><tr><td><div style="background-color: #248700; height: 15px; width: 15px; border: 1px solid black;" /></td><td>EM - Environmental management</td></tr><tr><td><div style="background-color: #3B968D; height: 15px; width: 15px; border: 1px solid black;" /></td><td>CN - Conservation</td></tr><tr><td><div style="background-color: #3883A2; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>CN1 - Local</td></tr><tr><td><div style="background-color: #3883A2; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>CN2 - District</td></tr><tr><td><div style="background-color: #3883A2; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>CN3 - Metropolitan</td></tr><tr><td><div style="background-color: #F9CEA1; height: 15px; width: 15px; border: 1px solid black;" /></td><td>EC - Emerging community</td></tr><tr><td><div style="background-color: #602B00; height: 15px; width: 15px; border: 1px solid black;" /></td><td>EI - Extractive industry</td></tr><tr><td><div style="background-color: #F87213; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>MU1 - Inner city</td></tr><tr><td><div style="background-color: #F87213; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>MU2 - Centre frame</td></tr><tr><td><div style="background-color: #F87213; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>MU3 - Corridor</td></tr><tr><td><div style="background-color: #9E7B77; height: 15px; width: 15px; border: 1px solid black;" /></td><td>RU - Rural</td></tr><tr><td><div style="background-color: #F4FCE4; height: 15px; width: 15px; border: 1px solid black;" /></td><td>T - Township</td></tr><tr><td><div style="background-color: #F7FF89; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>CF1 - Major health care</td></tr><tr><td><div style="background-color: #F7FF89; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>CF2 - Major sports venue</td></tr><tr><td><div style="background-color: #F7FF89; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>CF3 - Cemetery</td></tr><tr><td><div style="background-color: #F7FF89; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>CF4 - Community purpose</td></tr><tr><td><div style="background-color: #F7FF89; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>CF5 - Education purpose</td></tr><tr><td><div style="background-color: #F7FF89; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>CF6 - Emergency services</td></tr><tr><td><div style="background-color: #F7FF89; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>CF7 - Health care purposes</td></tr><tr><td><div style="background-color: #877A8E; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>SC1 - Specialised centre (Major education and research facility)</td></tr><tr><td><div style="background-color: #877A8E; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>SC2 - Specialised centre (Entertainment and conference centre)</td></tr><tr><td><div style="background-color: #877A8E; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>SC3 - Specialised centre (Brisbane Markets)</td></tr><tr><td><div style="background-color: #877A8E; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>SC4 - Specialised centre (Large format retail)</td></tr><tr><td><div style="background-color: #877A8E; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>SC5 - Specialised centre (Mixed industry and business)</td></tr><tr><td><div style="background-color: #877A8E; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>SC6 - Specialised centre (Marina)</td></tr><tr><td><div style="background-color: #B9C203; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>SP1 - Special purpose (Defence)</td></tr><tr><td><div style="background-color: #B9C203; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>SP2 - Special purpose (Detention facility)</td></tr><tr><td><div style="background-color: #B9C203; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>SP3 - Special purpose (Transport infrastructure)</td></tr><tr><td><div style="background-color: #B9C203; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>SP4 - Special purpose (Utility services)</td></tr><tr><td><div style="background-color: #B9C203; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>SP5 - Special purpose (Airport)</td></tr><tr><td><div style="background-color: #B9C203; height: 15px; width: 15px; border: 1px solid blue;" /></td><td>SP6 - Special purpose (Port)</td></tr></table></div>', true, "legend");
                // console.log(selectedBaseMap);
                // console.log(layer.get('title') + ' visible: ' + layer.getVisible());
            });
        });

        // The serach input
        var search = $("<input>").attr("placeholder", "filter");
        $(".menu-switcher-header").append(search.get(0));
    },
    createOverlayMenu: function (map) {
        // Overlay
        var menu = new Overlay({
            closeBox: true,
            className: "slide-left menu",
            content: $("#menu").get(0)
        });
        map.addControl(menu);

        // A toggle control to show/hide the menu
        var t = new Toggle({
            html: "M",
            className: "menu",
            title: "Menu",
            onToggle: function () {
                menu.toggle();
            }
        });

        let menu_control = $('<div className="menu-control">');
        let menu_switcher_header = $('<div className="menu-switcher-header"><div>');
        let menu_switcher = $('<div className="menu-switcher">');
        let menu_info = $('<div className="menu-info">');

        $(".menu").append(menu_control);
        $(".menu").append(menu_switcher_header);
        $(".menu").append(menu_switcher);
        $(".menu").append(menu_info);

        map.addControl(t);
    },
    createDefaultActions: function (map) {
        var selectSingleClick = new Select();
        var selectClick = new Select({
            condition: click
        });

        var selectPointerMove = new Select({
            condition: pointerMove
        });
        map.addInteraction(selectSingleClick);
        map.addInteraction(selectClick);
        map.addInteraction(selectPointerMove);
    },
    createSelectAttributes: function (map) {
        // Select control
        var selectCtrl = new ext_Select({
            target: $(".menu").get(0),
            //source: vectorSource,
            property: $(".options select").val()
        });
        map.addControl(selectCtrl);
    },
    createPopupOverlay: function (map) {
        let placemark = [
            new Popup({
                // className: "dragPopup-container",
                position: [0, 6000000],
                closeBox: true,
                positioning: "bottom-center",
                html: "Move<br/>me!",

                stopEvent: false
            }),
            new Placemark({
                position: [0, 5600000],
                stopEvent: false
            })
        ];

        placemark.forEach(function (p) {
            map.addOverlay(p);
        });

        // Drag interaction

        var drag = new ext_Drag({
            overlays: placemark
        });
        console.log(drag);
        map.addInteraction(drag);

        drag.on("dragend", function (e) {
            console.log(e);
            if (e.overlay === placemark[1]) {
                // Animate placemark
                placemark[1].show(true);
            }
        });
    },
    createMeasures: function (map) {
        var drawLine = new Draw({ type: "LineString" });
        let mSource = new VectorSource({});
        let mLayer = new VectorLayer({
            source: mSource,
            title: "meas"
        });
        map.addLayer(mLayer);
        map.addInteraction(drawLine);
        var drawPoly = new Draw({ type: "Polygon" });
        map.addInteraction(drawPoly);
        drawPoly.setActive(false);
        drawLine.setActive(false);
        // Add a tooltip
        var tooltip = new Tooltip();
        map.addOverlay(tooltip);

        // Set feature on drawstart
        drawLine.on("drawstart", tooltip.setFeature.bind(tooltip));
        // Remove feature on finish
        drawLine.on(
            ["change:active", "drawend"],
            tooltip.removeFeature.bind(tooltip)
        );
    },
    createLegend: function (map) { }
};