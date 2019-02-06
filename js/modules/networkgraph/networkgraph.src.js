/**
 * Networkgraph series
 *
 * (c) 2010-2019 Paweł Fus
 *
 * License: www.highcharts.com/license
 */

'use strict';
import H from '../../parts/Globals.js';
import '../../parts/Utilities.js';
import '../../parts/Options.js';
import '../../mixins/nodes.js';
import '/layouts.js';

var addEvent = H.addEvent,
    defined = H.defined,
    seriesType = H.seriesType,
    seriesTypes = H.seriesTypes,
    pick = H.pick,
    Chart = H.Chart,
    Point = H.Point,
    Series = H.Series;

/**
 * A networkgraph is a type of relationship chart, where connnections
 * (links) attracts nodes (points) and other nodes repulse each other.
 *
 * @extends      plotOptions.line
 * @product      highcharts
 * @sample       highcharts/demo/network-graph/
 *               Networkgraph
 * @since        7.0.0
 * @excluding    boostThreshold, animation, animationLimit, connectEnds,
 *               connectNulls, dragDrop, getExtremesFromAll, label, linecap,
 *               negativeColor, pointInterval, pointIntervalUnit,
 *               pointPlacement, pointStart, softThreshold, stack, stacking,
 *               step, threshold, xAxis, yAxis, zoneAxis
 * @optionparent plotOptions.networkgraph
 */
seriesType('networkgraph', 'line', {
    marker: {
        enabled: true
    },
    dataLabels: {
        /**
         * The
         * [format string](https://www.highcharts.com/docs/chart-concepts/labels-and-string-formatting)
         * specifying what to show for _links_ in the networkgraph.
         *
         * @type {string}
         * @since 7.1.0
         * @apioption plotOptions.networkgraph.dataLabels.linkFormat
         * @default undefined
         */

        /**
         * The
         * [format string](https://www.highcharts.com/docs/chart-concepts/labels-and-string-formatting)
         * specifying what to show for _node_ in the networkgraph.
         *
         * In v7.0 defaults to `{key}`, since v7.1 defaults to `undefined` and
         * `formatter` is used instead.
         *
         * @type {string}
         * @apioption plotOptions.networkgraph.dataLabels.format
         */

        /**
         * Callback to format data labels for _links_ in the sankey diagram.
         * The `linkFormat` option takes precedence over the `linkFormatter`.
         *
         * @type  {Highcharts.FormatterCallbackFunction<Highcharts.SeriesDataLabelsFormatterContextObject>}
         * @since 7.1.0
         * @default function () { return this.point.fromNode.name + ' \u2192 ' + this.point.toNode.name; }
         */
        linkFormatter: function () {
            return this.point.fromNode.name + ' \u2192 ' +
                this.point.toNode.name;
        },

        /**
         * Callback JavaScript function to format the data label for a node.
         * Note that if a `format` is defined, the format takes precedence and
         * the formatter is ignored. Available data are:
         *
         * - `this.point`: The point (node) object. The node name, if defined,
         *   is available through `this.point.name`. Arrays:
         *   `this.point.linksFrom` and `this.point.linksTo` contains all nodes
         *   connected to this point.
         *
         * - `this.series`: The series object. The series name is available
         *   through`this.series.name`.
         *
         * - `this.key`: The ID of the node.
         *
         * - `this.color`: The color of the node.
         *
         * @type    {Highcharts.FormatterCallbackFunction<Highcharts.SeriesDataLabelsFormatterContextObject>}
         * @default function () { return this.key; }
         */
        formatter: function () {
            return this.key;
        }
    },
    /**
     * Link style options
     */
    link: {
        /**
         * A name for the dash style to use for links.
         *
         * @type      {String}
         * @apioption plotOptions.networkgraph.link.dashStyle
         * @defaults  undefined
         */

        /**
         * Color of the link between two nodes.
         */
        color: 'rgba(100, 100, 100, 0.5)',
        /**
         * Width (px) of the link between two nodes.
         */
        width: 1
    },
    /**
     * Flag to determine if nodes are draggable or not.
     */
    draggable: true,
    layoutAlgorithm: {
        /**
         * Repulsive force applied on a node. Passed are two arguments:
         * - `d` - which is current distance between two nodes
         * - `k` - which is desired distance between two nodes
         *
         * In `verlet` integration, defaults to:
         * `function (d, k) { return (k - d) / d * (k > d ? 1 : 0) }`
         *
         * @see         [layoutAlgorithm.integration](#series.networkgraph.layoutAlgorithm.integration)
         * @apioption   plotOptions.networkgraph.layoutAlgorithm.repulsiveForce
         * @sample      highcharts/series-networkgraph/forces/
         *              Custom forces with Euler integration
         * @sample      highcharts/series-networkgraph/cuboids/
         *              Custom forces with Verlet integration
         * @type        {Function}
         * @default function (d, k) { return k * k / d; }
         */

        /**
         * Attraction force applied on a node which is conected to another node
         * by a link. Passed are two arguments:
         * - `d` - which is current distance between two nodes
         * - `k` - which is desired distance between two nodes
         *
         * In `verlet` integration, defaults to:
         * `function (d, k) { return (k - d) / d; }`
         *
         * @see         [layoutAlgorithm.integration](#series.networkgraph.layoutAlgorithm.integration)
         * @apioption   plotOptions.networkgraph.layoutAlgorithm.attractiveForce
         * @sample      highcharts/series-networkgraph/forces/
         *              Custom forces with Euler integration
         * @sample      highcharts/series-networkgraph/cuboids/
         *              Custom forces with Verlet integration
         * @type        {Function}
         * @default function (d, k) { return k * k / d; }
         */

        /**
         * Ideal length (px) of the link between two nodes. When not defined,
         * length is calculated as:
         * `Math.pow(availableWidth * availableHeight / nodesLength, 0.4);`
         *
         * Note: Because of the algorithm specification, length of each link
         * might be not exactly as specified.
         *
         * @type      {number}
         * @apioption series.networkgraph.layoutAlgorithm.linkLength
         * @sample    highcharts/series-networkgraph/styled-links/
         *            Numerical values
         * @defaults  undefined
         */

        /**
         * Initial layout algorithm for positioning nodes. Can be one of
         * built-in options ("circle", "random") or a function where positions
         * should be set on each node (`this.nodes`) as `node.plotX` and
         * `node.plotY`
         *
         * @sample      highcharts/series-networkgraph/initial-positions/
         *              Initial positions with callback
         * @type        {String|Function}
         * @validvalue  ["circle", "random"]
         */
        initialPositions: 'circle',
        /**
         * Experimental. Enables live simulation of the algorithm
         * implementation. All nodes are animated as the forces applies on
         * them.
         *
         * @sample       highcharts/demo/network-graph/
         *               Live simulation enabled
         */
        enableSimulation: false,
        /**
         * Barnes-Hut approximation only.
         * Deteremines when distance between cell and node is small enough to
         * caculate forces. Value of `theta` is compared directly with quotient
         * `s / d`, where `s` is the size of the cell, and `d` is distance
         * between center of cell's mass and currently compared node.
         *
         * @see         [layoutAlgorithm.approximation](#series.networkgraph.layoutAlgorithm.approximation)
         * @since       7.1.0
         */
        theta: 0.5,
        /**
         * Approximation used to calculate repulsive forces affecting nodes.
         * By default, when calculateing net force, nodes are compared against
         * each other, which gives O(N^2) complexity. Using Barnes-Hut
         * approximation, we decrease this to O(N log N), but the resulting
         * graph will have different layout. Barnes-Hut approximation divides
         * space into rectangles via quad tree, where forces exerted on nodes
         * are calculated directly for nearby cells, and for all others, cells
         * are treated as a separate node with center of mass.
         *
         * @see         [layoutAlgorithm.theta](#series.networkgraph.layoutAlgorithm.theta)
         * @validvalue  ["barnes-hut", "none"]
         * @since       7.1.0
         */
        approximation: 'none',
        /**
         * Type of the algorithm used when positioning nodes.
         *
         * @validvalue  ["reingold-fruchterman"]
         */
        type: 'reingold-fruchterman',
        /**
         * Integration type. Available options are `'euler'` and `'verlet'`.
         * Integration determines how forces are applied on particles. In Euler
         * integration, force is applied direct as `newPosition += velocity;`.
         * In Verlet integration, new position is based on a previous posittion
         * without velocity: `newPosition += previousPosition - newPosition`.
         *
         * Note that different integrations give different results as forces
         * are different.
         *
         * In Highcharts v7.0.x only `'euler'` integration was supported.
         *
         * @since       7.1.0
         * @sample      highcharts/series-networkgraph/forces/
         *              Custom forces with Euler integration
         * @validvalue  ["euler", "verlet"]
         */
        integration: 'verlet',
        /**
         * Max number of iterations before algorithm will stop. In general,
         * algorithm should find positions sooner, but when rendering huge
         * number of nodes, it is recommended to increase this value as
         * finding perfect graph positions can require more time.
         */
        maxIterations: 1000,
        /**
         * Gravitational const used in the barycenter force of the algorithm.
         *
         * @sample      highcharts/series-networkgraph/forces/
         *              Custom forces with Euler integration
         */
        gravitationalConstant: 0.0625,
        /**
         * Friction applied on forces to prevent nodes rushing to fast to the
         * desired positions.
         */
        friction: -0.981
    },
    showInLegend: false
}, {
    forces: ['barycenter', 'repulsive', 'attractive'],
    isNetworkgraph: true,
    drawGraph: null,
    isCartesian: false,
    requireSorting: false,
    directTouch: true,
    noSharedTooltip: true,
    trackerGroups: ['group', 'markerGroup', 'dataLabelsGroup'],
    drawTracker: H.TrackerMixin.drawTrackerPoint,
    // Animation is run in `series.simulation`.
    animate: null,
    /**
     * Create a single node that holds information on incoming and outgoing
     * links.
     */
    createNode: H.NodesMixin.createNode,

    init: function () {

        Series.prototype.init.apply(this, arguments);

        addEvent(this, 'updatedData', function () {
            if (this.layout) {
                this.layout.stop();
            }
        });

        return this;
    },

    /**
     * Extend generatePoints by adding the nodes, which are Point objects
     * but pushed to the this.nodes array.
     */
    generatePoints: function () {
        var nodeLookup = {},
            chart = this.chart;

        H.Series.prototype.generatePoints.call(this);

        if (!this.nodes) {
            this.nodes = []; // List of Point-like node items
        }
        this.colorCounter = 0;

        // Reset links from previous run
        this.nodes.forEach(function (node) {
            node.linksFrom.length = 0;
            node.linksTo.length = 0;
        });

        // Create the node list and set up links
        this.points.forEach(function (point) {
            if (defined(point.from)) {
                if (!nodeLookup[point.from]) {
                    nodeLookup[point.from] = this.createNode(point.from);
                }
                nodeLookup[point.from].linksFrom.push(point);
                point.fromNode = nodeLookup[point.from];

                // Point color defaults to the fromNode's color
                if (chart.styledMode) {
                    point.colorIndex = pick(
                        point.options.colorIndex,
                        nodeLookup[point.from].colorIndex
                    );
                } else {
                    point.color =
                        point.options.color || nodeLookup[point.from].color;
                }

            }
            if (defined(point.to)) {
                if (!nodeLookup[point.to]) {
                    nodeLookup[point.to] = this.createNode(point.to);
                }
                nodeLookup[point.to].linksTo.push(point);
                point.toNode = nodeLookup[point.to];
            }

            point.formatPrefix = 'link';
            point.name = point.name || point.id; // for use in formats
        }, this);


        if (this.options.nodes) {
            this.options.nodes.forEach(
                function (nodeOptions) {
                    if (!nodeLookup[nodeOptions.id]) {
                        nodeLookup[nodeOptions.id] = this
                            .createNode(nodeOptions.id);
                    }
                },
                this
            );
        }

        this.nodes.forEach(function (node) {
            node.degree = node.getDegree();
        });
    },

    // Extend the default marker attribs by using a non-rounded X position,
    // otherwise the nodes will jump from pixel to pixel which looks a bit jaggy
    // when approaching equilibrium.
    markerAttribs: function (point, state) {
        var attribs = Series.prototype.markerAttribs.call(this, point, state);

        attribs.x = point.plotX - (attribs.width / 2 || 0);
        return attribs;
    },

    /**
     * Run pre-translation by generating the nodeColumns.
     */
    translate: function () {
        if (!this.processedXData) {
            this.processData();
        }
        this.generatePoints();

        this.deferLayout();

        this.nodes.forEach(function (node) {
            // Draw the links from this node
            node.isInside = true;
            node.linksFrom.forEach(function (point) {

                point.shapeType = 'path';

                // Pass test in drawPoints
                point.y = 1;
            });
        });
    },

    deferLayout: function () {
        var layoutOptions = this.options.layoutAlgorithm,
            graphLayoutsStorage = this.chart.graphLayoutsStorage,
            chartOptions = this.chart.options.chart,
            layout;

        if (!this.visible) {
            return;
        }

        if (!graphLayoutsStorage) {
            this.chart.graphLayoutsStorage = graphLayoutsStorage = {};
        }

        layout = graphLayoutsStorage[layoutOptions.type];

        if (!layout) {
            layoutOptions.enableSimulation = !defined(chartOptions.forExport) ?
                layoutOptions.enableSimulation :
                !chartOptions.forExport;

            graphLayoutsStorage[layoutOptions.type] = layout =
                new H.layouts[layoutOptions.type](layoutOptions);
        }

        this.layout = layout;

        layout.setArea(0, 0, this.chart.plotWidth, this.chart.plotHeight);
        layout.addSeries(this);
        layout.addNodes(this.nodes);
        layout.addLinks(this.points);
    },

    /**
     * Extend the render function to also render this.nodes together with
     * the points.
     */
    render: function () {
        var points = this.points,
            hoverPoint = this.chart.hoverPoint,
            dataLabels = [];

        // Render markers:
        this.points = this.nodes;
        seriesTypes.line.prototype.render.call(this);
        this.points = points;

        points.forEach(function (point) {
            if (point.fromNode && point.toNode) {
                point.renderLink();
                point.redrawLink();
            }
        });

        if (hoverPoint && hoverPoint.series === this) {
            this.redrawHalo(hoverPoint);
        }

        if (this.chart.hasRendered) {
            this.nodes.concat(this.points).forEach(function (node) {
                if (node.dataLabel) {
                    dataLabels.push(node.dataLabel);
                }
            });

            this.chart.hideOverlappingLabels(dataLabels);
        }
    },

    // Networkgraph has two separate collecions of nodes and lins, render
    // dataLabels for both sets:
    drawDataLabels: function () {
        // Render link and node labels
        this.points = this.data.concat(this.points);
        Series.prototype.drawDataLabels.apply(this, arguments);

        // Restore nodes to be points array
        this.points = this.nodes;
    },
    /*
     * Draggable mode:
     */
    redrawHalo: function (point) {
        if (point && this.halo) {
            this.halo.attr({
                d: point.haloPath(
                    this.options.states.hover.halo.size
                )
            });
        }
    },
    onMouseDown: function (point, event) {
        var normalizedEvent = this.chart.pointer.normalize(event);

        point.fixedPosition = {
            chartX: normalizedEvent.chartX,
            chartY: normalizedEvent.chartY,
            plotX: point.plotX,
            plotY: point.plotY
        };

        point.inDragMode = true;
    },
    onMouseMove: function (point, event) {
        if (point.fixedPosition && point.inDragMode) {
            var series = this,
                chart = series.chart,
                normalizedEvent = chart.pointer.normalize(event),
                diffX = point.fixedPosition.chartX - normalizedEvent.chartX,
                diffY = point.fixedPosition.chartY - normalizedEvent.chartY,
                newPlotX,
                newPlotY;

            // At least 5px to apply change (avoids simple click):
            if (Math.abs(diffX) > 5 || Math.abs(diffY) > 5) {
                newPlotX = point.fixedPosition.plotX - diffX;
                newPlotY = point.fixedPosition.plotY - diffY;

                if (chart.isInsidePlot(newPlotX, newPlotY)) {
                    point.plotX = newPlotX;
                    point.plotY = newPlotY;

                    series.redrawHalo();

                    if (!series.layout.simulation) {
                        // Start new simulation:
                        if (!series.layout.enableSimulation) {
                            // Run only one iteration to speed things up:
                            series.layout.setMaxIterations(1);
                        }
                        // When dragging nodes, we don't need to calculate
                        // initial positions and rendering nodes:
                        series.layout.setInitialRendering(false);
                        series.layout.run();
                        // Restore defaults:
                        series.layout.setInitialRendering(true);
                    } else {
                        // Extend current simulation:
                        series.layout.resetSimulation();
                    }
                }
            }
        }
    },
    onMouseUp: function (point) {
        if (point.fixedPosition) {
            this.layout.run();
            point.inDragMode = false;
            if (!this.options.fixedDraggable) {
                delete point.fixedPosition;
            }
        }
    },
    destroy: function () {
        this.nodes.forEach(function (node) {
            node.destroy();
        });
        return Series.prototype.destroy.apply(this, arguments);
    }
}, {
    init: function () {
        Point.prototype.init.apply(this, arguments);

        addEvent(
            this,
            'mouseOver',
            function () {
                H.css(this.series.chart.container, { cursor: 'move' });
            }
        );
        addEvent(
            this,
            'mouseOut',
            function () {
                H.css(this.series.chart.container, { cursor: 'default' });
            }
        );

        return this;
    },
    getDegree: function () {
        var deg = this.isNode ? this.linksFrom.length + this.linksTo.length : 0;

        return deg === 0 ? 1 : deg;
    },
    // Links:
    getLinkAttribues: function () {
        var linkOptions = this.series.options.link,
            pointOptions = this.options;

        return this.series.chart.styledMode ? {} : {
            'stroke-width': pick(pointOptions.width, linkOptions.width),
            stroke: pointOptions.color || linkOptions.color,
            dashstyle: pointOptions.dashStyle || linkOptions.dashStyle
        };
    },
    renderLink: function () {
        if (!this.graphic) {
            this.graphic = this.series.chart.renderer
                .path(
                    this.getLinkPath()
                )
                .attr(this.getLinkAttribues())
                .add(this.series.group);
        }
    },
    redrawLink: function () {
        var path = this.getLinkPath();
        if (this.graphic) {
            this.shapeArgs = {
                d: path
            };
            this.graphic.animate(this.shapeArgs);

            // Required for dataLabels:
            this.plotX = (path[1] + path[4]) / 2;
            this.plotY = (path[2] + path[5]) / 2;
        }
    },
    getMass: function () {
        var m1 = this.fromNode.mass,
            m2 = this.toNode.mass,
            sum = m1 + m2;

        return {
            fromNode: 1 - m1 / sum,
            toNode: 1 - m2 / sum
        };
    },
    getLinkPath: function () {
        var left = this.fromNode,
            right = this.toNode;

        // Start always from left to the right node, to prevent rendering labels
        // upside down
        if (left.plotX > right.plotX) {
            left = this.toNode;
            right = this.fromNode;
        }

        return [
            'M',
            left.plotX,
            left.plotY,
            'L',
            right.plotX,
            right.plotY
        ];
        /*
        IDEA: different link shapes?
        return [
            'M',
            from.plotX,
            from.plotY,
            'Q',
            (to.plotX + from.plotX) / 2,
            (to.plotY + from.plotY) / 2 + 15,
            to.plotX,
            to.plotY
        ];*/
    },
    isValid: function () {
        return !this.isNode || defined(this.id);
    },
    remove: function () {
        if (this.isNode) {
            this.series.layout.removeNode(this);
        } else {
            this.series.layout.removeLink(this);
        }

        return Point.prototype.remove.apply(this, arguments);
    },

    // Default utils:
    destroy: function () {
        if (this.isNode) {
            this.linksFrom.forEach(
                function (linkFrom) {
                    if (linkFrom.graphic) {
                        linkFrom.graphic = linkFrom.graphic.destroy();
                    }

                    if (linkFrom.dataLabel) {
                        linkFrom.dataLabel = linkFrom.dataLabel.destroy();
                    }
                }
            );
        }

        return Point.prototype.destroy.apply(this, arguments);
    }
});

/*
 * Multiple series support:
 */
// Clear previous layouts
addEvent(Chart, 'predraw', function () {
    if (this.graphLayoutsStorage) {
        H.objectEach(
            this.graphLayoutsStorage,
            function (layout) {
                layout.stop();
            }
        );
    }
});
addEvent(Chart, 'render', function () {
    if (this.graphLayoutsStorage) {
        H.setAnimation(false, this);
        H.objectEach(
            this.graphLayoutsStorage,
            function (layout) {
                layout.run();
            }
        );
    }
});

/*
 * Draggable mode:
 */
addEvent(
    Chart,
    'load',
    function () {
        var chart = this,
            unbinders = [];

        if (chart.container) {
            unbinders.push(
                addEvent(
                    chart.container,
                    'mousedown',
                    function (event) {
                        var point = chart.hoverPoint;

                        if (
                            point &&
                            point.series &&
                            point.series.isNetworkgraph &&
                            point.series.options.draggable
                        ) {
                            point.series.onMouseDown(point, event);
                            unbinders.push(addEvent(
                                chart.container,
                                'mousemove',
                                function (e) {
                                    return point.series.onMouseMove(point, e);
                                }
                            ));
                            unbinders.push(addEvent(
                                chart.container.ownerDocument,
                                'mouseup',
                                function (e) {
                                    return point.series.onMouseUp(point, e);
                                }
                            ));
                        }
                    }
                )
            );
        }

        addEvent(chart, 'destroy', function () {
            unbinders.forEach(function (unbind) {
                unbind();
            });
        });
    }
);

/**
 * A `networkgraph` series. If the [type](#series.networkgraph.type) option is
 * not specified, it is inherited from [chart.type](#chart.type).
 *
 * @type      {Object}
 * @extends   series,plotOptions.networkgraph
 * @excluding boostThreshold, animation, animationLimit, connectEnds,
 *            connectNulls, dragDrop, getExtremesFromAll, label, linecap,
 *            negativeColor, pointInterval, pointIntervalUnit,
 *            pointPlacement, pointStart, softThreshold, stack, stacking,
 *            step, threshold, xAxis, yAxis, zoneAxis
 * @product   highcharts
 * @apioption series.networkgraph
 */

/**
 * An array of data points for the series. For the `networkgraph` series type,
 * points can be given in the following way:
 *
 * An array of objects with named values. The following snippet shows only a
 * few settings, see the complete options set below. If the total number of
 * data points exceeds the series'
 * [turboThreshold](#series.area.turboThreshold), this option is not available.
 *
 *  ```js
 *     data: [{
 *         from: 'Category1',
 *         to: 'Category2'
 *     }, {
 *         from: 'Category1',
 *         to: 'Category3'
 *     }]
 *  ```
 *
 * @type      {Array<Object|Array|Number>}
 * @extends   series.line.data
 * @excluding drilldown,marker,x,y,draDrop
 * @sample    {highcharts} highcharts/chart/reflow-true/
 *            Numerical values
 * @sample    {highcharts} highcharts/series/data-array-of-arrays/
 *            Arrays of numeric x and y
 * @sample    {highcharts} highcharts/series/data-array-of-arrays-datetime/
 *            Arrays of datetime x and y
 * @sample    {highcharts} highcharts/series/data-array-of-name-value/
 *            Arrays of point.name and y
 * @sample    {highcharts} highcharts/series/data-array-of-objects/
 *            Config objects
 * @product   highcharts
 * @apioption series.networkgraph.data
 */


/**
 * The node that the link runs from.
 *
 * @type      {String}
 * @product   highcharts
 * @apioption series.networkgraph.data.from
 */

/**
 * The node that the link runs to.
 *
 * @type      {String}
 * @product   highcharts
 * @apioption series.networkgraph.data.to
 */

/**
 * The weight of the link.
 *
 * @type      {Number}
 * @product   highcharts
 * @apioption series.networkgraph.data.weight
 */

/**
  * A collection of options for the individual nodes. The nodes in a
  * networkgraph diagram are auto-generated instances of `Highcharts.Point`,
  * but options can be applied here and linked by the `id`.
  *
  * @sample highcharts/series-networkgraph/data-options/
  *         Networkgraph diagram with node options
  *
  * @type      {Array<*>}
  * @product   highcharts
  * @apioption series.networkgraph.nodes
  */

/**
  * The id of the auto-generated node, refering to the `from` or `to` setting of
  * the link.
  *
  * @type      {string}
  * @product   highcharts
  * @apioption series.networkgraph.nodes.id
  */

/**
  * The color of the auto generated node.
  *
  * @type      {Highcharts.ColorString}
  * @product   highcharts
  * @apioption series.networkgraph.nodes.color
  */

/**
  * The color index of the auto generated node, especially for use in styled
  * mode.
  *
  * @type      {number}
  * @product   highcharts
  * @apioption series.networkgraph.nodes.colorIndex
  */

/**
  * The name to display for the node in data labels and tooltips. Use this when
  * the name is different from the `id`. Where the id must be unique for each
  * node, this is not necessary for the name.
  *
  * @sample highcharts/series-networkgraph/data-options/
  *         Networkgraph diagram with node options
  *
  * @type      {string}
  * @product   highcharts
  * @apioption series.networkgraph.nodes.name
  */

/**
 * Mass of the node. By default, each node has mass equal to it's marker radius
 * . Mass is used to determine how two connected nodes should affect
 * each other:
 *
 * Attractive force is multiplied by the ratio of two connected
 * nodes; if a big node has weights twice as the small one, then the small one
 * will move towards the big one twice faster than the big one to the small one
 * .
 *
 * @sample highcharts/series-networkgraph/ragdoll/
 *         Mass determined by marker.radius
 *
 * @type      {Number}
 * @product   highcharts
 * @apioption series.networkgraph.nodes.mass
 */
