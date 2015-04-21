describe("L.DNC.LayerList > ", function () {
    var map;

    beforeEach(function () {
        map =  new L.Map(document.createElement('div')).setView([0, 0],3);

        var dropzoneEl = document.createElement('div');
        dropzoneEl.setAttribute('id','dropzone');
        document.body.appendChild(dropzoneEl);
    });

    afterEach(function(){
    });


    describe("initialize > ", function () {
        var layerlist;

        beforeEach(function () {
            layerlist = new L.DNC.LayerList( { layerContainerId: 'dropzone' } );
        });

        afterEach(function(){

        });

        it("LayerList.initialize options and members setup correctly > ", function () {
            // options
            expect(layerlist.options.layerContainerId).to.equal('dropzone');
            expect(layerlist.options.autoZIndex).to.equal(true);
            expect(layerlist.options.zoomToExtentOnAdd).to.equal(true);
            // members
            expect(layerlist._handlingClick).to.equal(false);
            expect(layerlist._lastZIndex).to.equal(0);
            expect(layerlist._layers).to.eql({});
            expect(typeof layerlist.selection).to.equal("object");
            expect(layerlist.layerContainer.getAttribute('id')).to.equal('dropzone');
        });

        it("LayerList intialized correctly > ", function () {
            expect(layerlist instanceof L.DNC.LayerList).to.equal(true);
        });

    });

    describe("_initLayout > ", function () {
        var layerlist;

        beforeEach(function () {
            layerlist = new L.DNC.LayerList( { layerContainerId: 'dropzone' } );
        });

        afterEach(function(){

        });

        it("LayerList._initLayout creates expected DOM elements > ", function () {
            layerlist._initLayout();
            expect(layerlist._container.getAttribute('class')).to.equal('json-layer-list');
            expect(layerlist._container.getAttribute('id')).to.equal('layer-list');
            expect(layerlist.layerContainer.children.length).to.equal(1);
            expect(layerlist.layerContainer.firstElementChild.getAttribute('id')).to.equal('layer-list');
        });

    });

    describe("onAdd > ", function () {
        var layerlist;

        beforeEach(function () {
            layerlist = new L.DNC.LayerList( { layerContainerId: 'dropzone' } );
        });

        afterEach(function(){

        });

        it("LayerList.onAdd returns the expected DOM elements > ", function () {
            var container = layerlist.onAdd();
            expect(container.getAttribute('class')).to.equal('json-layer-list');
            expect(container.getAttribute('id')).to.equal('layer-list');
        });

    });

    describe("onAdd > ", function () {
        var layerlist;
        var layerListSpy;

        beforeEach(function () {
            layerlist = new L.DNC.LayerList( { layerContainerId: 'dropzone' } );
            layerListSpy = sinon.spy(L.DNC.LayerList.prototype, "_addItem" );
        });

        afterEach(function(){
            layerListSpy.restore();
        });

        it("LayerList.onAdd returns the expected DOM elements > ", function () {
            var container = layerlist.onAdd();
            expect(container.getAttribute('class')).to.equal('json-layer-list');
            expect(container.getAttribute('id')).to.equal('layer-list');
        });

        /*
        **
        **  on initialize _update will be called, but this._layers will be empty
        **  and so this._addItem should never be called
        **
        */
        it("LayerList.onAdd with empty this._layers should not call this._addItem > ", function () {
            var container = layerlist.onAdd();
            expect(layerListSpy.called).to.equal(false);
        });

    });


    describe("addTo > ", function () {
        var layerlist;
        var fakeContainerEl = L.DomUtil.create('ul', "json-layer-list");

        beforeEach(function () {
            layerlist = new L.DNC.LayerList( { layerContainerId: 'dropzone' } );

            // we already have tests for this.remove and this.onAdd
            // so mock it here to return dummy DOM elem or do nothing
            // no reason to retest nested calls
            sinon.stub(L.DNC.LayerList.prototype, "onAdd", function(){
                return fakeContainerEl
            });
            sinon.stub(L.DNC.LayerList.prototype, "remove", function(){
            });
        });

        afterEach(function(){
            L.DNC.LayerList.prototype.onAdd.restore();
            L.DNC.LayerList.prototype.remove.restore();
        });

        it("LayerList.addTo returns correct instance of layerList > ", function () {
            var layerListInstance = layerlist.addTo(map);
            expect(layerListInstance instanceof L.DNC.LayerList).to.equal(true);
            expect(layerListInstance._map).to.eql(map);
            expect(layerListInstance._container).to.eql(fakeContainerEl);
        });

    });

    describe("remove > ", function () {
        var layerlist;
        var mockOnRemove;

        beforeEach(function () {
            layerlist = new L.DNC.LayerList( { layerContainerId: 'dropzone' } );

            // add an onRemove function for testing purposes
            L.DNC.LayerList.prototype.onRemove = function(){};
            mockOnRemove = sinon.spy(L.DNC.LayerList.prototype,"onRemove");

        });

        afterEach(function(){
            mockOnRemove.restore();
        });

        it("LayerList.remove returns instance on empty this._map ref > ", function () {
            var layerListInstance = layerlist.remove();
            expect(layerListInstance).to.eql(layerlist);
        });

        it("LayerList.remove calls this.onRemove lifecycle hook if it exists > ", function () {
            layerlist._map = map;
            layerlist._initLayout();
            layerlist.remove();
            expect(mockOnRemove.called).to.equal(true);
        });

        it("LayerList.remove returns instance with deleted this._map ref and empty container DOMC > ", function () {
            layerlist._map = map;
            layerlist._initLayout();
            layerlist.remove();
            console.log( "[ MAP ]: ", layerlist._map );
            expect(layerlist._map).to.equal(null);
            expect(layerlist._container).to.equal(null);
        });

    });

    describe("addLayerToList > ", function () {
        var layer;
        var layerlist;
        var mappySpy;
        var geojsonSpy;
        var updateSpy;

        beforeEach(function () {
            layerlist = new L.DNC.LayerList( { layerContainerId: 'dropzone' } );
            layer = L.geoJson( window.testingData.polygon );

            // LayerList._update will be tested separately so mock it here
            updateSpy = sinon.spy(L.DNC.LayerList.prototype, "_update");
            // add a spy to know when branching on zoomToExtentonAdd runs
            mappySpy = sinon.spy(map, "fitBounds");
            // add a spy to know when L.GeoJSON.setZIndex is called in autoZIndex branching
            geojsonSpy = sinon.spy(L.GeoJSON.prototype, "setZIndex");
        });

        afterEach(function(){
            L.DNC.LayerList.prototype._update.restore();
            mappySpy.restore();
            geojsonSpy.restore();
            updateSpy.restore();
        });

        it("LayerList.addLayerToList when options.autoZIndex is false > ", function () {
            layerlist._map = map;
            layerlist.options.autoZIndex = false;
            layerlist.options.zoomToExtentOnAdd = true;
            layerlist.addLayerToList( layer, "test", true );
            var lookupId = L.stamp( layer );

            // assertions
            expect(layerlist._layers[lookupId]).to.eql({
                layer: layer,
                name: "test",
                overlay: true
            });
            expect(layerlist._lastZIndex).to.equal(0);
            expect(geojsonSpy.called).to.equal(false);
            expect(updateSpy.called).to.equal(true);
            expect(mappySpy.called).to.equal(true);

        });

        it("LayerList.addLayerToList when options.autoZIndex is true > ", function () {
            layerlist._map = map;
            layerlist.options.autoZIndex = true;
            layerlist.options.zoomToExtentOnAdd = true;
            layerlist.addLayerToList( layer, "test", true );
            var lookupId = L.stamp( layer );

            // assertions
            expect(layerlist._layers[lookupId]).to.eql({
                layer: layer,
                name: "test",
                overlay: true
            });
            expect(layerlist._lastZIndex).to.equal(1);
            expect(geojsonSpy.called).to.equal(true);
            expect(updateSpy.called).to.equal(true);
            expect(mappySpy.called).to.equal(true);
        });

        it("LayerList.addLayerToList when options.zoomToExtentOnAdd is false > ", function () {
            layerlist._map = map;
            layerlist.options.autoZIndex = true;
            layerlist.options.zoomToExtentOnAdd = false;
            layerlist.addLayerToList( layer, "test", true );
            var lookupId = L.stamp( layer );

            // assertions
            expect(layerlist._layers[lookupId]).to.eql({
                layer: layer,
                name: "test",
                overlay: true
            });
            expect(layerlist._lastZIndex).to.equal(1);
            expect(geojsonSpy.called).to.equal(true);
            expect(updateSpy.called).to.equal(true);
            expect(mappySpy.called).to.equal(false);
        });


    });

    describe("removeLayerFromList > ", function () {
        var layer;
        var layerlist;

        beforeEach(function () {
            layerlist = new L.DNC.LayerList( { layerContainerId: 'dropzone' } );
            layer = L.geoJson( window.testingData.polygon );
        });

        afterEach(function(){
        });

        it("LayerList.removeLayerFromList removes the cached layer and returns LayerList instance > ", function () {
            var lookupId = L.stamp( layer );
            layerlist._layers[ lookupId ] = { foo: 'bar' };
            var returnedInstance = layerlist.removeLayerFromList(layer);

            // assertions
            expect(returnedInstance instanceof L.DNC.LayerList).to.equal(true);
            expect(typeof returnedInstance._layers[ lookupId ]).to.equal("undefined");
        });

    });

    describe("_updated > ", function () {
        var layer;
        var layerlist;
        var mockAddLayer;

        beforeEach(function () {
            layerlist = new L.DNC.LayerList( { layerContainerId: 'dropzone' } );
            layer = L.geoJson( window.testingData.polygon );

            // LayerList._addItem will have it's own tests, so mock up here
            sinon.stub(L.DNC.LayerList.prototype,"_addItem",function(){ return true; });
            // to test if this._map.hasLayer branching works, mock these up
            mockAddLayer = sinon.spy(map,'addLayer', function(){return true;});
        });

        afterEach(function(){
            mockAddLayer.restore();
            L.DNC.LayerList.prototype._addItem.restore();
        });

        it("LayerList._updated when this._container is falsy > ", function () {
            layerlist._map = map;
            var lookupId = L.stamp(layer);
            layerlist._layers[ lookupId ] = {
                layer: layer,
                name: "test",
                overlay: true
            }
            layerlist._container = null;
            sinon.stub(map,'hasLayer', function(){ return true; });
            var returnedInstance = layerlist._update();

            // assertions
            expect(returnedInstance instanceof L.DNC.LayerList).to.equal(true);
            expect(mockAddLayer.called).to.equal(false);
            map.hasLayer.restore();
        });

        it("LayerList._updated when this._container is truthy with no this._layers > ", function () {
            layerlist._map = map;
            layerlist._container = document.createElement('div');
            sinon.stub(map,'hasLayer', function(){ return true; });
            var returnedInstance = layerlist._update();

            // assertions
            expect(mockAddLayer.called).to.equal(false);
            map.hasLayer.restore();
        });

        it("LayerList._updated when this._map already has that layer > ", function () {
            layerlist._map = map;
            var lookupId = L.stamp(layer);
            layerlist._layers[ lookupId ] = {
                layer: layer,
                name: "test",
                overlay: true
            };
            layerlist._container = document.createElement('div');
            sinon.stub(map,'hasLayer', function(){ return true; });
            var returnedInstance = layerlist._update();

            // assertions
            expect(returnedInstance instanceof L.DNC.LayerList).to.equal(true);
            expect(mockAddLayer.called).to.equal(false);
            map.hasLayer.restore();
        });

        it("LayerList._updated when this._map DOES NOT already have that layer > ", function () {
            layerlist._map = map;
            var lookupId = L.stamp(layer);
            layerlist._layers[ lookupId ] = {
                layer: layer,
                name: "test",
                overlay: true
            };
            layerlist._container = document.createElement('div');
            sinon.stub(map,'hasLayer', function(){ return false; });
            var returnedInstance = layerlist._update();

            // assertions
            expect(returnedInstance instanceof L.DNC.LayerList).to.equal(true);
            expect(mockAddLayer.called).to.equal(true);
            map.hasLayer.restore();
        });

    });

});