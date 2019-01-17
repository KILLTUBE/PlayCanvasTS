/// <reference path="../math/mat4.ts" />
/// <reference path="../math/vec3.ts" />
/// <reference path="../math/quat.ts" />


namespace pc {

    /**
     * @constructor
     * @name pc.GraphNode
     * @classdesc A hierarchical scene node.
     * @param {String} [name] The non-unique name of the graph node, default is "Untitled".
     * @property {String} name The non-unique name of a graph node.
     * @property {pc.Tags} tags Interface for tagging graph nodes. Tag based searches can be performed using the {@link pc.GraphNode#findByTag} function.
     */
    export class GraphNode {
        name: string;
        tags: Tags;
        _labels: any;
        localPosition: Vec3;
        localRotation: Quat;
        localScale: Vec3;
        localEulerAngles: Vec3;
        position: Vec3;
        rotation: Quat;
        eulerAngles: Vec3;
        localTransform: Mat4;
        _dirtyLocal: boolean;
        _aabbVer: number;
        worldTransform: Mat4;
        _dirtyWorld: boolean;
        normalMatrix: Mat3;
        _dirtyNormal: boolean;
        _right: any;
        _up: any;
        _forward: any;
        _parent: any;
        _children: any[];
        _graphDepth: number;
        _enabled: boolean;
        _enabledInHierarchy: boolean;
        scaleCompensation: boolean;



        static scaleCompensatePosTransform = new pc.Mat4();
        static scaleCompensatePos = new pc.Vec3();
        static scaleCompensateRot = new pc.Quat();
        static scaleCompensateRot2 = new pc.Quat();
        static scaleCompensateScale = new pc.Vec3();
        static scaleCompensateScaleForParent = new pc.Vec3();
        tmpMat4 = new pc.Mat4();
        tmpQuat = new pc.Quat();

        constructor(name?: string) {
            this.name = typeof name === "string" ? name : "Untitled"; // Non-unique human readable name
            this.tags = new pc.Tags(this);

            this._labels = { };

            // Local-space properties of transform (only first 3 are settable by the user)
            this.localPosition = new pc.Vec3(0, 0, 0);
            this.localRotation = new pc.Quat(0, 0, 0, 1);
            this.localScale = new pc.Vec3(1, 1, 1);
            this.localEulerAngles = new pc.Vec3(0, 0, 0); // Only calculated on request

            // World-space properties of transform
            this.position = new pc.Vec3(0, 0, 0);
            this.rotation = new pc.Quat(0, 0, 0, 1);
            this.eulerAngles = new pc.Vec3(0, 0, 0);

            this.localTransform = new pc.Mat4();
            this._dirtyLocal = false;
            this._aabbVer = 0;

            this.worldTransform = new pc.Mat4();
            this._dirtyWorld = false;

            this.normalMatrix = new pc.Mat3();
            this._dirtyNormal = true;

            this._right = null;
            this._up = null;
            this._forward = null;

            this._parent = null;
            this._children = [];
            this._graphDepth = 0;

            this._enabled = true;
            this._enabledInHierarchy = false;

            this.scaleCompensation = false;
        };

        _notifyHierarchyStateChanged(node: any, enabled: boolean) {
            node._onHierarchyStateChanged(enabled);

            var c = node._children;
            for (var i = 0, len = c.length; i < len; i++) {
                if (c[i]._enabled)
                    this._notifyHierarchyStateChanged(c[i], enabled);
            }
        }

        /**
         * @private
         * @function
         * @name pc.GraphNode#_onHierarchyStateChanged
         * @description Called when the enabled flag of the entity or one of its parents changes.
         * @param {Boolean} enabled true if enabled in the hierarchy, false if disabled.
         */
        _onHierarchyStateChanged(enabled: boolean) {
            // Override in derived classes
            this._enabledInHierarchy = enabled;
        }

        _cloneInternal(clone: any) {
            clone.name = this.name;

            var tags = this.tags._list;
            for (var i = 0; i < tags.length; i++)
                clone.tags.add(tags[i]);

            clone._labels = Object.assign({}, this._labels);

            clone.localPosition.copy(this.localPosition);
            clone.localRotation.copy(this.localRotation);
            clone.localScale.copy(this.localScale);
            clone.localEulerAngles.copy(this.localEulerAngles);

            clone.position.copy(this.position);
            clone.rotation.copy(this.rotation);
            clone.eulerAngles.copy(this.eulerAngles);

            clone.localTransform.copy(this.localTransform);
            clone._dirtyLocal = this._dirtyLocal;

            clone.worldTransform.copy(this.worldTransform);
            clone._dirtyWorld = this._dirtyWorld;

            if (clone._dirtyLocal || clone._dirtyWorld)
                clone._queueSync();

            clone._dirtyNormal = this._dirtyNormal;
            clone._aabbVer = this._aabbVer + 1;

            clone._enabled = this._enabled;

            clone.scaleCompensation = this.scaleCompensation;

            // false as this node is not in the hierarchy yet
            clone._enabledInHierarchy = false;
        }

        clone() {
            var clone = new pc.GraphNode();
            this._cloneInternal(clone);
            return clone;
        }

        /**
         * @function
         * @name pc.GraphNode#find
         * @description Search the graph node and all of its descendants for the nodes that satisfy some search criteria.
         * @param {Function|String} attr This can either be a function or a string. If it's a function, it is executed
         * for each descendant node to test if node satisfies the search logic. Returning true from the function will
         * include the node into the results. If it's a string then it represents the name of a field or a method of the
         * node. If this is the name of a field then the value passed as the second argument will be checked for equality.
         * If this is the name of a function then the return value of the function will be checked for equality against
         * the valued passed as the second argument to this function.
         * @param {Object} [value] If the first argument (attr) is a property name then this value will be checked against
         * the value of the property.
         * @returns {pc.GraphNode[]} The array of graph nodes that match the search criteria.
         * @example
         * // Finds all nodes that have a model component and have `door` in their lower-cased name
         * var doors = house.find(function(node) {
         *     return node.model && node.name.toLowerCase().indexOf('door') !== -1;
         * });
         * @example
         * // Finds all nodes that have the name property set to 'Test'
         * var entities = parent.find('name', 'Test');
         */
        find(attr: Function | string, value: any) {
            var results = [];
            var len = this._children.length;
            var i, descendants;

            if (attr instanceof Function) {
                var fn = attr;

                for (i = 0; i < len; i++) {
                    if (fn(this._children[i]))
                        results.push(this._children[i]);

                    descendants = this._children[i].find(fn);
                    if (descendants.length)
                        results = results.concat(descendants);
                }
            } else {
                var testValue;

                if (this[attr]) {
                    if (this[attr] instanceof Function) {
                        testValue = this[attr]();
                    } else {
                        testValue = this[attr];
                    }
                    if (testValue === value)
                        results.push(this);
                }

                for (i = 0; i < len; ++i) {
                    descendants = this._children[i].find(attr, value);
                    if (descendants.length)
                        results = results.concat(descendants);
                }
            }

            return results;
        }

        /**
         * @function
         * @name pc.GraphNode#findOne
         * @description Search the graph node and all of its descendants for the first node that satisfies some search criteria.
         * @param {Function|String} attr This can either be a function or a string. If it's a function, it is executed
         * for each descendant node to test if node satisfies the search logic. Returning true from the function will
         * result in that node being returned from findOne. If it's a string then it represents the name of a field or a method of the
         * node. If this is the name of a field then the value passed as the second argument will be checked for equality.
         * If this is the name of a function then the return value of the function will be checked for equality against
         * the valued passed as the second argument to this function.
         * @param {Object} [value] If the first argument (attr) is a property name then this value will be checked against
         * the value of the property.
         * @returns {pc.GraphNode} A graph node that match the search criteria.
         * @example
         * // Find the first node that is called `head` and has a model component
         * var head = player.findOne(function(node) {
         *     return node.model && node.name === 'head';
         * });
         * @example
         * // Finds the first node that has the name property set to 'Test'
         * var node = parent.findOne('name', 'Test');
         */
        findOne(attr: Function | string, value?: Object) {
            var i;
            var len = this._children.length;
            var result = null;

            if (attr instanceof Function) {
                var fn = attr;

                result = fn(this);
                if (result)
                    return this;

                for (i = 0; i < len; i++) {
                    result = this._children[i].findOne(fn);
                    if (result)
                        return this._children[i];
                }
            } else {
                var testValue;
                if (this[attr]) {
                    if (this[attr] instanceof Function) {
                        testValue = this[attr]();
                    } else {
                        testValue = this[attr];
                    }
                    if (testValue === value) {
                        return this;
                    }
                }

                for (i = 0; i < len; i++) {
                    result = this._children[i].findOne(attr, value);
                    if (result !== null)
                        return result;
                }
            }

            return null;
        }

        /**
         * @function
         * @name pc.GraphNode#findByTag
         * @description Return all graph nodes that satisfy the search query.
         * Query can be simply a string, or comma separated strings,
         * to have inclusive results of assets that match at least one query.
         * A query that consists of an array of tags can be used to match graph nodes that have each tag of array
         * @param {String} query Name of a tag or array of tags
         * @returns {pc.GraphNode[]} A list of all graph nodes that match the query
         * @example
         * // Return all graph nodes that tagged by `animal`
         * var animals = node.findByTag("animal");
         * @example
         * // Return all graph nodes that tagged by `bird` OR `mammal`
         * var birdsAndMammals = node.findByTag("bird", "mammal");
         * @example
         * // Return all assets that tagged by `carnivore` AND `mammal`
         * var meatEatingMammals = node.findByTag([ "carnivore", "mammal" ]);
         * @example
         * // Return all assets that tagged by (`carnivore` AND `mammal`) OR (`carnivore` AND `reptile`)
         * var meatEatingMammalsAndReptiles = node.findByTag([ "carnivore", "mammal" ], [ "carnivore", "reptile" ]);
         */
        findByTag() {
            var tags = this.tags._processArguments(arguments);
            return this._findByTag(tags);
        }

        _findByTag(tags: Tags) {
            var result = [];
            var i, len = this._children.length;
            var descendants;

            for (i = 0; i < len; i++) {
                if (this._children[i].tags._has(tags))
                    result.push(this._children[i]);

                descendants = this._children[i]._findByTag(tags);
                if (descendants.length)
                    result = result.concat(descendants);
            }

            return result;
        }

        /**
         * @function
         * @name pc.GraphNode#findByName
         * @description Get the first node found in the graph with the name. The search
         * is depth first.
         * @param {String} name The name of the graph.
         * @returns {pc.GraphNode} The first node to be found matching the supplied name.
         */
        findByName(name: string): GraphNode | null {
            if (this.name === name) return this;

            for (var i = 0; i < this._children.length; i++) {
                var found = this._children[i].findByName(name);
                if (found !== null) return found;
            }
            return null;
        }

        /**
         * @function
         * @name pc.GraphNode#findByPath
         * @description Get the first node found in the graph by its full path in the graph.
         * The full path has this form 'parent/child/sub-child'. The search is depth first.
         * @param {String} path The full path of the pc.GraphNode.
         * @returns {pc.GraphNode} The first node to be found matching the supplied path.
         * @example
         * var path = this.entity.findByPath('child/another_child');
         */
        findByPath(path: string): GraphNode | null {
            // split the paths in parts. Each part represents a deeper hierarchy level
            var parts = path.split('/');
            var currentParent = this;
            var result = null;

            for (var i = 0, imax = parts.length; i < imax && currentParent; i++) {
                var part = parts[i];

                result = null;

                // check all the children
                var children = currentParent._children;
                for (var j = 0, jmax = children.length; j < jmax; j++) {
                    if (children[j].name == part) {
                        result = children[j];
                        break;
                    }
                }

                // keep going deeper in the hierarchy
                currentParent = result;
            }

            return result;
        }

        /**
         * @private
         * @deprecated
         * @function
         * @name pc.GraphNode#getRoot
         * @description Get the highest ancestor node from this graph node.
         * @returns {pc.GraphNode} The root node of the hierarchy to which this node belongs.
         * @example
         * var root = this.entity.getRoot();
         */
        getRoot(): GraphNode {
            var parent = this._parent;
            if (!parent) {
                return this;
            }

            while (parent._parent) {
                parent = parent._parent;
            }

            return parent;
        }

        /**
         * @private
         * @deprecated
         * @function
         * @name pc.GraphNode#getParent
         * @description Get the parent GraphNode
         * @returns {pc.GraphNode} The parent node
         * @example
         * var parent = this.entity.getParent();
         */
        getParent(): GraphNode | null {
            return this._parent;
        }

        /**
         * @function
         * @name pc.GraphNode#isDescendantOf
         * @description Check if node is descendant of another node.
         * @param {pc.GraphNode} node Potential ancestor of node.
         * @returns {Boolean} if node is descendant of another node.
         * @example
         * if (roof.isDescendantOf(house)) {
         *     // roof is descendant of house entity
         * }
         */
        isDescendantOf(node: GraphNode): boolean {
            var parent = this._parent;
            while (parent) {
                if (parent === node)
                    return true;

                parent = parent._parent;
            }
            return false;
        }

        /**
         * @function
         * @name pc.GraphNode#isAncestorOf
         * @description Check if node is ancestor for another node.
         * @param {pc.GraphNode} node Potential descendant of node.
         * @returns {Boolean} if node is ancestor for another node
         * @example
         * if (body.isAncestorOf(foot)) {
         *     // foot is within body's hierarchy
         * }
         */
        isAncestorOf(node: GraphNode): boolean {
            return node.isDescendantOf(this);
        }

        /**
         * @private
         * @deprecated
         * @function
         * @name pc.GraphNode#getChildren
         * @description Get the children of this graph node.
         * @returns {pc.GraphNode[]} The child array of this node.
         * @example
         * var children = this.entity.getChildren();
         * for (i = 0; i < children.length; i++) {
         * // children[i]
         * }
         */
        getChildren(): GraphNode[] {
            return this._children;
        }

        /**
         * @function
         * @name pc.GraphNode#getEulerAngles
         * @description Get the world space rotation for the specified GraphNode in Euler angle
         * form. The order of the returned Euler angles is XYZ. The value returned by this function
         * should be considered read-only. In order to set the world-space rotation of the graph
         * node, use {@link pc.GraphNode#setEulerAngles}.
         * @returns {pc.Vec3} The world space rotation of the graph node in Euler angle form.
         * @example
         * var angles = this.entity.getEulerAngles(); // [0,0,0]
         * angles[1] = 180; // rotate the entity around Y by 180 degrees
         * this.entity.setEulerAngles(angles);
         */
        getEulerAngles(): Vec3 {
            this.getWorldTransform().getEulerAngles(this.eulerAngles);
            return this.eulerAngles;
        }

        /**
         * @function
         * @name pc.GraphNode#getLocalEulerAngles
         * @description Get the rotation in local space for the specified GraphNode. The rotation
         * is returned as euler angles in a 3-dimensional vector where the order is XYZ. The
         * returned vector should be considered read-only. To update the local rotation, use
         * {@link pc.GraphNode#setLocalEulerAngles}.
         * @returns {pc.Vec3} The local space rotation of the graph node as euler angles in XYZ order.
         * @example
         * var angles = this.entity.getLocalEulerAngles();
         * angles[1] = 180;
         * this.entity.setLocalEulerAngles(angles);
         */
        getLocalEulerAngles(): Vec3 {
            this.localRotation.getEulerAngles(this.localEulerAngles);
            return this.localEulerAngles;
        }

        /**
         * @function
         * @name pc.GraphNode#getLocalPosition
         * @description Get the position in local space for the specified GraphNode. The position
         * is returned as a 3-dimensional vector. The returned vector should be considered read-only.
         * To update the local position, use {@link pc.GraphNode#setLocalPosition}.
         * @returns {pc.Vec3} The local space position of the graph node.
         * @example
         * var position = this.entity.getLocalPosition();
         * position[0] += 1; // move the entity 1 unit along x.
         * this.entity.setLocalPosition(position);
         */
        getLocalPosition(): Vec3 {
            return this.localPosition;
        }

        /**
         * @function
         * @name pc.GraphNode#getLocalRotation
         * @description Get the rotation in local space for the specified GraphNode. The rotation
         * is returned as a quaternion. The returned quaternion should be considered read-only.
         * To update the local rotation, use {@link pc.GraphNode#setLocalRotation}.
         * @returns {pc.Quat} The local space rotation of the graph node as a quaternion.
         * @example
         * var rotation = this.entity.getLocalRotation();
         */
        getLocalRotation(): Quat {
            return this.localRotation;
        }

        /**
         * @function
         * @name pc.GraphNode#getLocalScale
         * @description Get the scale in local space for the specified GraphNode. The scale
         * is returned as a 3-dimensional vector. The returned vector should be considered read-only.
         * To update the local scale, use {@link pc.GraphNode#setLocalScale}.
         * @returns {pc.Vec3} The local space scale of the graph node.
         * @example
         * var scale = this.entity.getLocalScale();
         * scale.x = 100;
         * this.entity.setLocalScale(scale);
         */
        getLocalScale(): Vec3 {
            return this.localScale;
        }

        /**
         * @function
         * @name pc.GraphNode#getLocalTransform
         * @description Get the local transform matrix for this graph node. This matrix
         * is the transform relative to the node's parent's world transformation matrix.
         * @returns {pc.Mat4} The node's local transformation matrix.
         * @example
         * var transform = this.entity.getLocalTransform();
         */
        getLocalTransform(): Mat4 {
            if (this._dirtyLocal) {
                this.localTransform.setTRS(this.localPosition, this.localRotation, this.localScale);
                this._dirtyLocal = false;
            }
            return this.localTransform;
        }

        /**
         * @private
         * @deprecated
         * @function
         * @name pc.GraphNode#getName
         * @description Get the human-readable name for this graph node. Note the name
         * is not guaranteed to be unique. For Entities, this is the name that is set in the PlayCanvas Editor.
         * @returns {String} The name of the node.
         * @example
         * if (this.entity.getName() === "My Entity") {
         *     console.log("My Entity Found");
         * }
         */
        getName(): string {
            return this.name;
        }

        /**
         * @function
         * @name pc.GraphNode#getPosition
         * @description Get the world space position for the specified GraphNode. The
         * value returned by this function should be considered read-only. In order to set
         * the world-space position of the graph node, use {@link pc.GraphNode#setPosition}.
         * @returns {pc.Vec3} The world space position of the graph node.
         * @example
         * var position = this.entity.getPosition();
         * position.x = 10;
         * this.entity.setPosition(position);
         */
        getPosition(): Vec3 {
            this.getWorldTransform().getTranslation(this.position);
            return this.position;
        }

        /**
         * @function
         * @name pc.GraphNode#getRotation
         * @description Get the world space rotation for the specified GraphNode in quaternion
         * form. The value returned by this function should be considered read-only. In order
         * to set the world-space rotation of the graph node, use {@link pc.GraphNode#setRotation}.
         * @returns {pc.Quat} The world space rotation of the graph node as a quaternion.
         * @example
         * var rotation = this.entity.getRotation();
         */
        getRotation(): Quat {
            this.rotation.setFromMat4(this.getWorldTransform());
            return this.rotation;
        }

        /**
         * @function
         * @name pc.GraphNode#getWorldTransform
         * @description Get the world transformation matrix for this graph node.
         * @returns {pc.Mat4} The node's world transformation matrix.
         * @example
         * var transform = this.entity.getWorldTransform();
         */
        getWorldTransform(): Mat4 {
            if (!this._dirtyLocal && !this._dirtyWorld)
                return this.worldTransform;

            if (this._parent)
                this._parent.getWorldTransform();

            this._sync();

            return this.worldTransform;
        }

        /**
         * @function
         * @name pc.GraphNode#reparent
         * @description Remove graph node from current parent and add as child to new parent
         * @param {pc.GraphNode} parent New parent to attach graph node to
         * @param {Number} index (optional) The child index where the child node should be placed.
         */
        reparent(parent: GraphNode, index: number): void {
            var current = this._parent;
            if (current)
                current.removeChild(this);

            if (parent) {
                if (index >= 0) {
                    parent.insertChild(this, index);
                } else {
                    parent.addChild(this);
                }
            }
        }

        /**
         * @function
         * @name pc.GraphNode#setLocalEulerAngles
         * @description Sets the local-space rotation of the specified graph node using euler angles.
         * Eulers are interpreted in XYZ order. Eulers must be specified in degrees. This function
         * has two valid signatures: you can either pass a 3D vector or 3 numbers to specify the
         * local-space euler rotation.
         * @param {pc.Vec3|Number} x - 3-dimensional vector holding eulers or rotation around local-space
         * x-axis in degrees.
         * @param {Number} [y] - rotation around local-space y-axis in degrees.
         * @param {Number} [z] - rotation around local-space z-axis in degrees.
         * @example
         * // Set rotation of 90 degrees around y-axis via 3 numbers
         * this.entity.setLocalEulerAngles(0, 90, 0);
         * @example
         * // Set rotation of 90 degrees around y-axis via a vector
         * var angles = new pc.Vec3(0, 90, 0);
         * this.entity.setLocalEulerAngles(angles);
         */
        setLocalEulerAngles(x: Vec3 | number, y?: number, z?: number) {
            if (x instanceof pc.Vec3) {
                this.localRotation.setFromEulerAngles(x.x, x.y, x.z);
            } else {
                this.localRotation.setFromEulerAngles(x, y, z);
            }

            if (!this._dirtyLocal)
                this._dirtifyLocal();
        }

        /**
         * @function
         * @name pc.GraphNode#setLocalPosition
         * @description Sets the local-space position of the specified graph node. This function
         * has two valid signatures: you can either pass a 3D vector or 3 numbers to specify the
         * local-space position.
         * @param {pc.Vec3|Number} x - 3-dimensional vector holding local-space position or
         * x-coordinate of local-space position.
         * @param {Number} [y] - y-coordinate of local-space position.
         * @param {Number} [z] - z-coordinate of local-space position.
         * @example
         * // Set via 3 numbers
         * this.entity.setLocalPosition(0, 10, 0);
         * @example
         * // Set via vector
         * var pos = new pc.Vec3(0, 10, 0);
         * this.entity.setLocalPosition(pos)
         */
        setLocalPosition(x: Vec3 | number, y?: number, z?: number) {
            if (x instanceof pc.Vec3) {
                this.localPosition.copy(x);
            } else {
                this.localPosition.set(x, y, z);
            }

            if (!this._dirtyLocal)
                this._dirtifyLocal();
        }

        /**
         * @function
         * @name pc.GraphNode#setLocalRotation
         * @description Sets the local-space rotation of the specified graph node. This function
         * has two valid signatures: you can either pass a quaternion or 3 numbers to specify the
         * local-space rotation.
         * @param {pc.Quat|Number} x - quaternion holding local-space rotation or x-component of
         * local-space quaternion rotation.
         * @param {Number} [y] - y-component of local-space quaternion rotation.
         * @param {Number} [z] - z-component of local-space quaternion rotation.
         * @param {Number} [w] - w-component of local-space quaternion rotation.
         * @example
         * // Set via 4 numbers
         * this.entity.setLocalRotation(0, 0, 0, 1);
         * @example
         * // Set via quaternion
         * var q = pc.Quat();
         * this.entity.setLocalRotation(q);
         */
        setLocalRotation(x: Quat | number, y?: number, z?: number, w?: number) {
            if (x instanceof pc.Quat) {
                this.localRotation.copy(x);
            } else {
                this.localRotation.set(x, y, z, w);
            }

            if (!this._dirtyLocal)
                this._dirtifyLocal();
        }

        /**
         * @function
         * @name pc.GraphNode#setLocalScale
         * @description Sets the local-space scale factor of the specified graph node. This function
         * has two valid signatures: you can either pass a 3D vector or 3 numbers to specify the
         * local-space scale.
         * @param {pc.Vec3|Number} x - 3-dimensional vector holding local-space scale or x-coordinate
         * of local-space scale.
         * @param {Number} [y] - y-coordinate of local-space scale.
         * @param {Number} [z] - z-coordinate of local-space scale.
         * @example
         * // Set via 3 numbers
         * this.entity.setLocalScale(10, 10, 10);
         * @example
         * // Set via vector
         * var scale = new pc.Vec3(10, 10, 10);
         * this.entity.setLocalScale(scale);
         */
        setLocalScale(x: Vec3 | number, y?: number, z?: number) {
            if (x instanceof pc.Vec3) {
                this.localScale.copy(x);
            } else {
                this.localScale.set(x, y, z);
            }

            if (!this._dirtyLocal)
                this._dirtifyLocal();
        }

        /**
         * @private
         * @deprecated
         * @function
         * @name pc.GraphNode#setName
         * @description Sets the non-unique name for this graph node.
         * @param {String} name The name for the node.
         * @example
         * this.entity.setName("My Entity");
         */
        setName(name: string): void {
            this.name = name;
        }

        _dirtifyLocal(): void {
            if (!this._dirtyLocal) {
                this._dirtyLocal = true;
                if (!this._dirtyWorld)
                    this._dirtifyWorld();
            }
        }

        _dirtifyWorld(): void {
            if (!this._dirtyWorld) {
                this._queueSync();
                if (!this._dirtyWorld)
                    this._dirtifyWorldImpl();
            }
        }

        _dirtifyWorldImpl(): void {
            this._dirtyWorld = true;
            for (var i = 0; i < this._children.length; i++) {
                if (!this._children[i]._dirtyWorld)
                    this._children[i]._dirtifyWorldImpl();
            }
            this._dirtyNormal = true;
            this._aabbVer++;
        }

        // Sync Queue is currently in App and there is no reference to App obj in graph-node
        // It's temporary solution to access it from global namespace
        _queueSync(): void {
            pc.Application.getApplication().syncQueue.push(this._graphDepth, this);
        }

        _cancelSync(): void {
            pc.Application.getApplication().syncQueue.erase(this);
        }

        destroy(): void {
            this._cancelSync();
        }

        /**
         * @function
         * @name pc.GraphNode#setPosition
         * @description Sets the world-space position of the specified graph node. This function
         * has two valid signatures: you can either pass a 3D vector or 3 numbers to specify the
         * world-space position.
         * @param {pc.Vec3|Number} x - 3-dimensional vector holding world-space position or
         * x-coordinate of world-space position.
         * @param {Number} [y] - y-coordinate of world-space position.
         * @param {Number} [z] - z-coordinate of world-space position.
         * @example
         * // Set via 3 numbers
         * this.entity.setPosition(0, 10, 0);
         * @example
         * // Set via vector
         * var position = new pc.Vec3(0, 10, 0);
         * this.entity.setPosition(position);
         */
        static setPosition_position = new pc.Vec3();
        static setPosition_invParentWtm = new pc.Mat4();
        setPosition(x: Vec3 | number, y?: number, z?: number) {
            if (x instanceof pc.Vec3) {
                GraphNode.setPosition_position.copy(x);
            } else {
                GraphNode.setPosition_position.set(x, y, z);
            }

            if (this._parent === null) {
                this.localPosition.copy(GraphNode.setPosition_position);
            } else {
                GraphNode.setPosition_invParentWtm.copy(this._parent.getWorldTransform()).invert();
                GraphNode.setPosition_invParentWtm.transformPoint(GraphNode.setPosition_position, this.localPosition);
            }

            if (!this._dirtyLocal)
                this._dirtifyLocal();
        }

        /**
         * @function
         * @name pc.GraphNode#setRotation
         * @description Sets the world-space rotation of the specified graph node. This function
         * has two valid signatures: you can either pass a quaternion or 3 numbers to specify the
         * world-space rotation.
         * @param {pc.Quat|Number} x - quaternion holding world-space rotation or x-component of
         * world-space quaternion rotation.
         * @param {Number} [y] - y-component of world-space quaternion rotation.
         * @param {Number} [z] - z-component of world-space quaternion rotation.
         * @param {Number} [w] - w-component of world-space quaternion rotation.
         * @example
         * // Set via 4 numbers
         * this.entity.setRotation(0, 0, 0, 1);
         * @example
         * // Set via quaternion
         * var q = pc.Quat();
         * this.entity.setRotation(q);
         */
        static setRotation_rotation = new pc.Quat();
        static setRotation_invParentRot = new pc.Quat();
        setRotation(x: Quat | number, y?: number, z?: number, w?: number) {

            //return function () {
                if (x instanceof pc.Quat) {
                    GraphNode.setRotation_rotation.copy(x);
                } else {
                    GraphNode.setRotation_rotation.set(x, y, z, w);
                }

                if (this._parent === null) {
                    this.localRotation.copy(GraphNode.setRotation_rotation);
                } else {
                    var parentRot = this._parent.getRotation();
                    GraphNode.setRotation_invParentRot.copy(parentRot).invert();
                    this.localRotation.copy(GraphNode.setRotation_invParentRot).mul(GraphNode.setRotation_rotation);
                }

                if (!this._dirtyLocal)
                    this._dirtifyLocal();
            //};
        }

        /**
         * @function
         * @name pc.GraphNode#setEulerAngles
         * @description Sets the world-space rotation of the specified graph node using euler angles.
         * Eulers are interpreted in XYZ order. Eulers must be specified in degrees. This function
         * has two valid signatures: you can either pass a 3D vector or 3 numbers to specify the
         * world-space euler rotation.
         * @param {pc.Vec3|Number} x - 3-dimensional vector holding eulers or rotation around world-space
         * x-axis in degrees.
         * @param {Number} [y] - rotation around world-space y-axis in degrees.
         * @param {Number} [z] - rotation around world-space z-axis in degrees.
         * @example
         * // Set rotation of 90 degrees around world-space y-axis via 3 numbers
         * this.entity.setEulerAngles(0, 90, 0);
         * @example
         * // Set rotation of 90 degrees around world-space y-axis via a vector
         * var angles = new pc.Vec3(0, 90, 0);
         * this.entity.setEulerAngles(angles);
         */
        static setEulerAngles_invParentRot = new pc.Quat();
        setEulerAngles(x: Vec3 | number, y?: number, z?: number) {
            if (x instanceof pc.Vec3) {
                this.localRotation.setFromEulerAngles(x.x, x.y, x.z);
            } else {
                this.localRotation.setFromEulerAngles(x, y, z);
            }

            if (this._parent !== null) {
                var parentRot = this._parent.getRotation();
                GraphNode.setEulerAngles_invParentRot.copy(parentRot).invert();
                this.localRotation.mul2(GraphNode.setEulerAngles_invParentRot, this.localRotation);
            }

            if (!this._dirtyLocal)
                this._dirtifyLocal();
        }

        /**
         * @function
         * @name pc.GraphNode#addChild
         * @description Add a new child to the child list and update the parent value of the child node
         * @param {pc.GraphNode} node The new child to add
         * @example
         * var e = new pc.Entity(app);
         * this.entity.addChild(e);
         */
        addChild(node: GraphNode): void {
            if (node._parent !== null)
                throw new Error("GraphNode is already parented");

            this._children.push(node);
            this._onInsertChild(node);
        }

        addChildAndSaveTransform(node: GraphNode): void {
            var wPos = node.getPosition();
            var wRot = node.getRotation();

            var current = node._parent;
            if (current)
                current.removeChild(node);


            node.setPosition(this.tmpMat4.copy(this.worldTransform).invert().transformPoint(wPos));
            node.setRotation(this.tmpQuat.copy(this.getRotation()).invert().mul(wRot));

            this._children.push(node);

            this._onInsertChild(node);
        }

        /**
         * @function
         * @name pc.GraphNode#insertChild
         * @description Insert a new child to the child list at the specified index and update the parent value of the child node
         * @param {pc.GraphNode} node The new child to insert
         * @param {Number} index The index in the child list of the parent where the new node will be inserted
         * @example
         * var e = new pc.Entity(app);
         * this.entity.insertChild(e, 1);
         */
        insertChild(node: GraphNode, index: number) {
            if (node._parent !== null)
                throw new Error("GraphNode is already parented");

            this._children.splice(index, 0, node);
            this._onInsertChild(node);
        }

        _onInsertChild(node: GraphNode) {
            node._parent = this;

            // the child node should be enabled in the hierarchy only if itself is enabled and if
            // this parent is enabled
            var enabledInHierarchy = (node._enabled && this.enabled);
            if (node._enabledInHierarchy !== enabledInHierarchy) {
                node._enabledInHierarchy = enabledInHierarchy;

                // propagate the change to the children - necessary if we reparent a node
                // under a parent with a different enabled state (if we reparent a node that is
                // not active in the hierarchy under a parent who is active in the hierarchy then
                // we want our node to be activated)
                node._notifyHierarchyStateChanged(node, enabledInHierarchy);
            }

            // The graph depth of the child and all of its descendants will now change
            node._updateGraphDepth();

            if (node._dirtyLocal || node._dirtyWorld) {
                node._queueSync();
            }
            // The child (plus subhierarchy) will need world transforms to be recalculated
            node._dirtifyLocal();

            // alert an entity that it has been inserted
            if (node.fire) node.fire('insert', this);

            // alert the parent that it has had a child inserted
            if (this.fire) this.fire('childinsert', node);
        }

        _updateGraphDepth(): void {
            if (this._parent) {
                this._graphDepth = this._parent._graphDepth + 1;
            } else {
                this._graphDepth = 0;
            }

            this._cancelSync();

            for (var i = 0, len = this._children.length; i < len; i++) {
                this._children[i]._updateGraphDepth();
            }
        }

        /**
         * @function
         * @name pc.GraphNode#removeChild
         * @description Remove the node from the child list and update the parent value of the child.
         * @param {pc.GraphNode} child The node to remove.
         * @example
         * var child = this.entity.children[0];
         * this.entity.removeChild(child);
         */
        removeChild(child: GraphNode): void {
            var i;
            var length = this._children.length;

            // Remove from child list
            for (i = 0; i < length; ++i) {
                if (this._children[i] === child) {
                    this._children.splice(i, 1);

                    // Clear parent
                    child._parent = null;
                    child._updateGraphDepth();

                    // alert the parent that it has had a child removed
                    if (this.fire) this.fire('childremove', child);

                    return;
                }
            }
        }

        /**
         * @private
         * @deprecated
         * @function
         * @name pc.GraphNode#addLabel
         * @description Add a string label to this graph node, labels can be used to group
         * and filter nodes. For example, the 'enemies' label could be applied to a group of NPCs
         * who are enemies.
         * @param {String} label The label to apply to this graph node.
         */
        addLabel(label: string): void {
            this._labels[label] = true;
        }

        /**
         * @private
         * @deprecated
         * @function
         * @name pc.GraphNode#getLabels
         * @description Get an array of all labels applied to this graph node.
         * @returns {String[]} An array of all labels.
         */
        getLabels(): string[] {
            return Object.keys(this._labels);
        }

        /**
         * @private
         * @deprecated
         * @function
         * @name pc.GraphNode#hasLabel
         * @description Test if a label has been applied to this graph node.
         * @param {String} label The label to test for.
         * @returns {Boolean} True if the label has been added to this GraphNode.
         *
         */
        hasLabel(label: string): boolean {
            return !!this._labels[label];
        }

        /**
         * @private
         * @deprecated
         * @function
         * @name pc.GraphNode#removeLabel
         * @description Remove label from this graph node.
         * @param {String} label The label to remove from this node.
         */
        removeLabel(label: string): void {
            delete this._labels[label];
        }

        /**
         * @private
         * @deprecated
         * @function
         * @name pc.GraphNode#findByLabel
         * @description Find all graph nodes from the root and all descendants with the label.
         * @param {String} label The label to search for.
         * @param {pc.GraphNode[]} [results] An array to store the results in.
         * @returns {pc.GraphNode[]} The array passed in or a new array of results.
         */
        findByLabel(label: string, results?: GraphNode[]) {
            var i, length = this._children.length;
            results = results || [];

            if (this.hasLabel(label)) {
                results.push(this);
            }

            for (i = 0; i < length; ++i) {
                results = this._children[i].findByLabel(label, results);
            }

            return results;
        }

        _sync(): void {
            if (this._dirtyLocal) {
                this.localTransform.setTRS(this.localPosition, this.localRotation, this.localScale);

                this._dirtyLocal = false;
            }

            if (this._dirtyWorld) {
                if (this._parent === null) {
                    this.worldTransform.copy(this.localTransform);
                } else {
                    if (this.scaleCompensation) {
                        var parentWorldScale;
                        var parent = this._parent;

                        // Find a parent of the first uncompensated node up in the hierarchy and use its scale * localScale
                        var scale = this.localScale;
                        var parentToUseScaleFrom = parent; // current parent
                        if (parentToUseScaleFrom) {
                            while (parentToUseScaleFrom && parentToUseScaleFrom.scaleCompensation) {
                                parentToUseScaleFrom = parentToUseScaleFrom._parent;
                            }
                            // topmost node with scale compensation
                            if (parentToUseScaleFrom) {
                                parentToUseScaleFrom = parentToUseScaleFrom._parent; // node without scale compensation
                                if (parentToUseScaleFrom) {
                                    parentWorldScale = parentToUseScaleFrom.worldTransform.getScale();
                                    GraphNode.scaleCompensateScale.mul2(parentWorldScale, this.localScale);
                                    scale = GraphNode.scaleCompensateScale;
                                }
                            }
                        }

                        // Rotation is as usual
                        GraphNode.scaleCompensateRot2.setFromMat4(parent.worldTransform);
                        GraphNode.scaleCompensateRot.mul2(GraphNode.scaleCompensateRot2, this.localRotation);

                        // Find matrix to transform position
                        var tmatrix = parent.worldTransform;
                        if (parent.scaleCompensation) {
                            GraphNode.scaleCompensateScaleForParent.mul2(parentWorldScale, parent.getLocalScale());
                            GraphNode.scaleCompensatePosTransform.setTRS(
                                parent.worldTransform.getTranslation(GraphNode.scaleCompensatePos),
                                GraphNode.scaleCompensateRot2,
                                GraphNode.scaleCompensateScaleForParent
                            );
                            tmatrix = GraphNode.scaleCompensatePosTransform;
                        }
                        tmatrix.transformPoint(this.localPosition, GraphNode.scaleCompensatePos);

                        this.worldTransform.setTRS(GraphNode.scaleCompensatePos, GraphNode.scaleCompensateRot, scale);

                    } else {
                        this.worldTransform.mul2(this._parent.worldTransform, this.localTransform);
                    }
                }

                this._dirtyWorld = false;
            }
        }

        /**
         * @private
         * @function
         * @name pc.GraphNode#syncHierarchy
         * @description Updates the world transformation matrices at this node and all of its descendants.
         */
        syncHierarchy(): void {
            if (!this._enabled)
                return;

            if (this._dirtyLocal || this._dirtyWorld) {
                this._sync();
            }

            var children = this._children;
            for (var i = 0, len = children.length; i < len; i++) {
                children[i].syncHierarchy();
            }
        }

        /**
         * @function
         * @name pc.GraphNode#lookAt
         * @description Reorients the graph node so that the negative z-axis points towards the target.
         * This function has two valid signatures. Either pass 3D vectors for the look at coordinate and up
         * vector, or pass numbers to represent the vectors.
         * @param {pc.Vec3|Number} x - If passing a 3D vector, this is the world-space coordinate to look at.
         * Otherwise, it is the x-component of the world-space coordinate to look at.
         * @param {pc.Vec3|Number} y - If passing a 3D vector, this is the world-space up vector for look at
         * transform. Otherwise, it is the y-component of the world-space coordinate to look at.
         * @param {Number} z - z-component of the world-space coordinate to look at.
         * @param {Number} [ux=0] - x-component of the up vector for the look at transform.
         * @param {Number} [uy=1] - y-component of the up vector for the look at transform.
         * @param {Number} [uz=0] - z-component of the up vector for the look at transform.
         * @example
         * // Look at another entity, using the (default) positive y-axis for up
         * var position = otherEntity.getPosition();
         * this.entity.lookAt(position);
         * @example
         * // Look at another entity, using the negative world y-axis for up
         * var position = otherEntity.getPosition();
         * this.entity.lookAt(position, pc.Vec3.DOWN);
         * @example
         * // Look at the world space origin, using the (default) positive y-axis for up
         * this.entity.lookAt(0, 0, 0);
         * @example
         * // Look at world-space coordinate [10, 10, 10], using the negative world y-axis for up
         * this.entity.lookAt(10, 10, 10, 0, -1, 0);
         */
        static lookAt_matrix = new pc.Mat4();
        static lookAt_target = new pc.Vec3();
        static lookAt_up = new pc.Vec3();
        static lookAt_rotation = new pc.Quat();
        lookAt(tx, ty, tz, ux, uy, uz) {
            if (tx instanceof pc.Vec3) {
                GraphNode.lookAt_target.copy(tx);

                if (ty instanceof pc.Vec3) { // vec3, vec3
                    GraphNode.lookAt_up.copy(ty);
                } else { // vec3
                    GraphNode.lookAt_up.copy(pc.Vec3.UP);
                }
            } else if (tz === undefined) {
                return;
            } else {
                GraphNode.lookAt_target.set(tx, ty, tz);

                if (ux !== undefined) { // number, number, number, number, number, number
                    GraphNode.lookAt_up.set(ux, uy, uz);
                } else { // number, number, number
                    GraphNode.lookAt_up.copy(pc.Vec3.UP);
                }
            }

            GraphNode.lookAt_matrix.setLookAt(this.getPosition(), GraphNode.lookAt_target, GraphNode.lookAt_up);
            GraphNode.lookAt_rotation.setFromMat4(GraphNode.lookAt_matrix);
            this.setRotation(GraphNode.lookAt_rotation);
        }

        /**
         * @function
         * @name pc.GraphNode#translate
         * @description Translates the graph node in world-space by the specified translation vector.
         * This function has two valid signatures: you can either pass a 3D vector or 3 numbers to
         * specify the world-space translation.
         * @param {pc.Vec3|Number} x - 3-dimensional vector holding world-space translation or
         * x-coordinate of world-space translation.
         * @param {Number} [y] - y-coordinate of world-space translation.
         * @param {Number} [z] - z-coordinate of world-space translation.
         * @example
         * // Translate via 3 numbers
         * this.entity.translate(10, 0, 0);
         * @example
         * // Translate via vector
         * var t = new pc.Vec3(10, 0, 0);
         * this.entity.translate(t);
         */
        static translate_translation = new pc.Vec3();
        translate(x, y, z) {
            if (x instanceof pc.Vec3) {
                GraphNode.translate_translation.copy(x);
            } else {
                GraphNode.translate_translation.set(x, y, z);
            }

            GraphNode.translate_translation.add(this.getPosition());
            this.setPosition(GraphNode.translate_translation);
        }

        /**
         * @function
         * @name pc.GraphNode#translateLocal
         * @description Translates the graph node in local-space by the specified translation vector.
         * This function has two valid signatures: you can either pass a 3D vector or 3 numbers to
         * specify the local-space translation.
         * @param {pc.Vec3|Number} x - 3-dimensional vector holding local-space translation or
         * x-coordinate of local-space translation.
         * @param {Number} [y] - y-coordinate of local-space translation.
         * @param {Number} [z] - z-coordinate of local-space translation.
         * @example
         * // Translate via 3 numbers
         * this.entity.translateLocal(10, 0, 0);
         * @example
         * // Translate via vector
         * var t = new pc.Vec3(10, 0, 0);
         * this.entity.translateLocal(t);
         */
        static translateLocal_translation = new pc.Vec3();
        translateLocal(x, y, z) {
            if (x instanceof pc.Vec3) {
                GraphNode.translateLocal_translation.copy(x);
            } else {
                GraphNode.translateLocal_translation.set(x, y, z);
            }

            this.localRotation.transformVector(GraphNode.translateLocal_translation, GraphNode.translateLocal_translation);
            this.localPosition.add(GraphNode.translateLocal_translation);

            if (!this._dirtyLocal)
                this._dirtifyLocal();
        }

        /**
         * @function
         * @name pc.GraphNode#rotate
         * @description Rotates the graph node in world-space by the specified Euler angles.
         * Eulers are specified in degrees in XYZ order. This function has two valid signatures:
         * you can either pass a 3D vector or 3 numbers to specify the world-space rotation.
         * @param {pc.Vec3|Number} x - 3-dimensional vector holding world-space rotation or
         * rotation around world-space x-axis in degrees.
         * @param {Number} [y] - Rotation around world-space y-axis in degrees.
         * @param {Number} [z] - Rotation around world-space z-axis in degrees.
         * @example
         * // Rotate via 3 numbers
         * this.entity.rotate(0, 90, 0);
         * @example
         * // Rotate via vector
         * var r = new pc.Vec3(0, 90, 0);
         * this.entity.rotate(r);
         */
        static quaternion = new pc.Quat();
        static invParentRot = new pc.Quat();
        rotate(x, y, z) {
            if (x instanceof pc.Vec3) {
                GraphNode.quaternion.setFromEulerAngles(x.x, x.y, x.z);
            } else {
                GraphNode.quaternion.setFromEulerAngles(x, y, z);
            }

            if (this._parent === null) {
                this.localRotation.mul2(GraphNode.quaternion, this.localRotation);
            } else {
                var rot = this.getRotation();
                var parentRot = this._parent.getRotation();

                GraphNode.invParentRot.copy(parentRot).invert();
                GraphNode.quaternion.mul2(GraphNode.invParentRot, GraphNode.quaternion);
                this.localRotation.mul2(GraphNode.quaternion, rot);
            }

            if (!this._dirtyLocal)
                this._dirtifyLocal();
        }

        /**
         * @function
         * @name pc.GraphNode#rotateLocal
         * @description Rotates the graph node in local-space by the specified Euler angles.
         * Eulers are specified in degrees in XYZ order. This function has two valid signatures:
         * you can either pass a 3D vector or 3 numbers to specify the local-space rotation.
         * @param {pc.Vec3|Number} x - 3-dimensional vector holding local-space rotation or
         * rotation around local-space x-axis in degrees.
         * @param {Number} [y] - Rotation around local-space y-axis in degrees.
         * @param {Number} [z] - Rotation around local-space z-axis in degrees.
         * @example
         * // Rotate via 3 numbers
         * this.entity.rotateLocal(0, 90, 0);
         * @example
         * // Rotate via vector
         * var r = new pc.Vec3(0, 90, 0);
         * this.entity.rotateLocal(r);
         */
        
        static rotateLocal_quaternion = new pc.Quat();
        rotateLocal(x, y, z) {

            if (x instanceof pc.Vec3) {
                GraphNode.rotateLocal_quaternion.setFromEulerAngles(x.x, x.y, x.z);
            } else {
                GraphNode.rotateLocal_quaternion.setFromEulerAngles(x, y, z);
            }

            this.localRotation.mul(GraphNode.rotateLocal_quaternion);

            if (!this._dirtyLocal)
                this._dirtifyLocal();
        };
    }

    /**
     * @readonly
     * @name pc.GraphNode#right
     * @description The normalized local space X-axis vector of the graph node in world space.
     * @type pc.Vec3
     */
    Object.defineProperty(GraphNode.prototype, 'right', {
        get: function () {
            if (!this._right) {
                this._right = new pc.Vec3();
            }
            return this.getWorldTransform().getX(this._right).normalize();
        }
    });

    /**
     * @readonly
     * @name pc.GraphNode#up
     * @description The normalized local space Y-axis vector of the graph node in world space.
     * @type pc.Vec3
     */
    Object.defineProperty(GraphNode.prototype, 'up', {
        get: function () {
            if (!this._up) {
                this._up = new pc.Vec3();
            }
            return this.getWorldTransform().getY(this._up).normalize();
        }
    });

    /**
     * @readonly
     * @name pc.GraphNode#forward
     * @description The normalized local space negative Z-axis vector of the graph node in world space.
     * @type pc.Vec3
     */
    Object.defineProperty(GraphNode.prototype, 'forward', {
        get: function () {
            if (!this._forward) {
                this._forward = new pc.Vec3();
            }
            return this.getWorldTransform().getZ(this._forward).normalize().scale(-1);
        }
    });

    /**
     * @name pc.GraphNode#enabled
     * @type Boolean
     * @description Enable or disable a GraphNode. If one of the GraphNode's parents is disabled
     * there will be no other side effects. If all the parents are enabled then
     * the new value will activate / deactivate all the enabled children of the GraphNode.
     */
    Object.defineProperty(GraphNode.prototype, 'enabled', {
        get: function () {
            // make sure to check this._enabled too because if that
            // was false when a parent was updated the _enabledInHierarchy
            // flag may not have been updated for optimization purposes
            return this._enabled && this._enabledInHierarchy;
        },

        set: function (enabled) {
            if (this._enabled !== enabled) {
                this._enabled = enabled;

                if (enabled) {
                    if (this._dirtyLocal || this._dirtyWorld) {
                        this._queueSync();
                    }
                    this._dirtifyLocal();
                } else {
                    this._cancelSync();
                }

                if (!this._parent || this._parent.enabled)
                    this._notifyHierarchyStateChanged(this, enabled);
            }
        }
    });

    /**
     * @readonly
     * @name pc.GraphNode#parent
     * @type pc.GraphNode
     * @description A read-only property to get a parent graph node
     */
    Object.defineProperty(GraphNode.prototype, 'parent', {
        get: function () {
            return this._parent;
        }
    });

    /**
     * @readonly
     * @name pc.GraphNode#root
     * @type pc.GraphNode
     * @description A read-only property to get highest graph node from current node
     */
    Object.defineProperty(GraphNode.prototype, 'root', {
        get: function () {
            var parent = this._parent;
            if (!parent)
                return this;

            while (parent._parent)
                parent = parent._parent;

            return parent;
        }
    });

    /**
     * @readonly
     * @name pc.GraphNode#children
     * @type pc.GraphNode[]
     * @description A read-only property to get the children of this graph node.
     */
    Object.defineProperty(GraphNode.prototype, 'children', {
        get: function () {
            return this._children;
        }
    });

    /**
     * @readonly
     * @name pc.GraphNode#graphDepth
     * @type Number
     * @description A read-only property to get the depth of this child within the graph. Note that for performance reasons this is only recalculated when a node is added to a new parent, i.e. it is not recalculated when a node is simply removed from the graph.
     */
    Object.defineProperty(GraphNode.prototype, 'graphDepth', {
        get: function () {
            return this._graphDepth;
        }
    });
}
