namespace pc {
  export interface IInterpolatedKeyDict {
    [name: string]: InterpolatedKey;
  }

  export interface ICurrKeyIndicies {
    [name: string]: number;
  }

  export class InterpolatedKey {
    public _written: boolean = false;
    public _name: string = "";
    public _keyFrames: any[] = [];

    // Result of interpolation
    public _quat: Quat = new Quat();
    public _pos: Vec3 = new Vec3();
    public _scale = new Vec3();

    // Optional destination for interpolated keyframe
    public _targetNode: GraphNode | null = null;

    public getTarget(): GraphNode | null {
      return this._targetNode;
    }

    public setTarget(node: GraphNode | null): void {
      this._targetNode = node;
    }
  }

  /**
   * @constructor
   * @name pc.Skeleton
   * @classdesc Represents a skeleton used to play animations.
   * @param {pc.GraphNode} graph The root pc.GraphNode of the skeleton.
   * @property {Boolean} looping Determines whether skeleton is looping its animation.
   */
  export class Skeleton {
    public _animation: Animation | null = null;
    public _time: number = 0;
    public looping: boolean = true;

    public _interpolatedKeys: InterpolatedKey[] = [];
    public _interpolatedKeyDict: IInterpolatedKeyDict = {};
    public _currKeyIndices: ICurrKeyIndicies = {};

    public graph: GraphNode | null;

    constructor(graph: GraphNode) {
      this.graph = null;

      var self: this = this;

      function addInterpolatedKeys(node: GraphNode): void {
        var interpKey = new InterpolatedKey();
        interpKey._name = node._name;
        self._interpolatedKeys.push(interpKey);
        self._interpolatedKeyDict[node.name] = interpKey;
        self._currKeyIndices[node.name] = 0;

        for (var i = 0; i < node._children.length; i++)
          addInterpolatedKeys(node._children[i]);
      }

      addInterpolatedKeys(graph);
    }

    /**
     * @function
     * @name pc.Skeleton#addTime
     * @description Progresses the animation assigned to the specified skeleton by the
     * supplied time delta. If the delta takes the animation passed its end point, if
     * the skeleton is set to loop, the animation will continue from the beginning.
     * Otherwise, the animation's current time will remain at its duration (i.e. the
     * end).
     * @param {Number} delta The time in seconds to progress the skeleton's animation.
     */
    public addTime(delta: number) {
      if (this._animation === null) return;
      var i: number;
      var node: Node, nodeName: string;
      var keys: Key[], interpKey: InterpolatedKey;
      var k1: Key, k2: Key, alpha: number;
      var nodes: Node[] = this._animation._nodes;
      var duration: number = this._animation.duration;

      // Check if we can early out
      if ((this._time === duration) && !this.looping) {
          return;
      }

      // Step the current time and work out if we need to jump ahead, clamp or wrap around
      this._time += delta;

      if (this._time > duration) {
        this._time = this.looping ? 0.0 : duration;
        for (i = 0; i < nodes.length; i++) {
          node = nodes[i];
          nodeName = node._name;
          this._currKeyIndices[nodeName] = 0;
        }
      } else if (this._time < 0) {
        this._time = this.looping ? duration : 0.0;
        for (i = 0; i < nodes.length; i++) {
          node = nodes[i];
          nodeName = node._name;
          this._currKeyIndices[nodeName] = node._keys.length - 2;
        }
      }


      // For each animated node...

      // keys index offset
      var offset: number = (delta >= 0 ? 1 : -1);

      var foundKey: boolean;
      for (i = 0; i < nodes.length; i++) {
        node = nodes[i];
        nodeName = node._name;
        keys = node._keys;

        // Determine the interpolated keyframe for this animated node
        interpKey = this._interpolatedKeyDict[nodeName];
        if (interpKey === undefined) {
            // #ifdef DEBUG
            console.warn('Unknown skeleton node name: ' + nodeName);
            // #endif
            continue;
        }
        // If there's only a single key, just copy the key to the interpolated key...
        foundKey = false;
        if (keys.length !== 1) {
            // Otherwise, find the keyframe pair for this node
            for (var currKeyIndex: number = this._currKeyIndices[nodeName]; currKeyIndex < keys.length - 1 && currKeyIndex >= 0; currKeyIndex += offset) {
                k1 = keys[currKeyIndex];
                k2 = keys[currKeyIndex + 1];

                if ((k1.time <= this._time) && (k2.time >= this._time)) {
                    alpha = (this._time - k1.time) / (k2.time - k1.time);

                    interpKey._pos.lerp(k1.position, k2.position, alpha);
                    interpKey._quat.slerp(k1.rotation, k2.rotation, alpha);
                    interpKey._scale.lerp(k1.scale, k2.scale, alpha);
                    interpKey._written = true;

                    this._currKeyIndices[nodeName] = currKeyIndex;
                    foundKey = true;
                    break;
                }
            }
        }
        if (keys.length === 1 || (!foundKey && this._time === 0.0 && this.looping)) {
          interpKey._pos.copy(keys[0].position);
          interpKey._quat.copy(keys[0].rotation);
          interpKey._scale.copy(keys[0].scale);
          interpKey._written = true;
        }
      }
    }

    /**
     * @function
     * @name pc.Skeleton#blend
     * @description Blends two skeletons together.
     * @param {pc.Skeleton} skel1 Skeleton holding the first pose to be blended.
     * @param {pc.Skeleton} skel2 Skeleton holding the second pose to be blended.
     * @param {Number} alpha The value controlling the interpolation in relation to the two input
     * skeletons. The value is in the range 0 to 1, 0 generating skel1, 1 generating skel2 and anything
     * in between generating a spherical interpolation between the two.
     */
    public blend(skel1: Skeleton, skel2: Skeleton, alpha: number) {
      var numNodes = this._interpolatedKeys.length;
      for (var i = 0; i < numNodes; i++) {
        var key1: InterpolatedKey = skel1._interpolatedKeys[i];
        var key2: InterpolatedKey = skel2._interpolatedKeys[i];
        var dstKey: InterpolatedKey = this._interpolatedKeys[i];

        if (key1._written && key2._written) {
          dstKey._quat.slerp(key1._quat, skel2._interpolatedKeys[i]._quat, alpha);
          dstKey._pos.lerp(key1._pos, skel2._interpolatedKeys[i]._pos, alpha);
          dstKey._scale.lerp(key1._scale, key2._scale, alpha);
          dstKey._written = true;
        } else if (key1._written) {
          dstKey._quat.copy(key1._quat);
          dstKey._pos.copy(key1._pos);
          dstKey._scale.copy(key1._scale);
          dstKey._written = true;
        } else if (key2._written) {
          dstKey._quat.copy(key2._quat);
          dstKey._pos.copy(key2._pos);
          dstKey._scale.copy(key2._scale);
          dstKey._written = true;
        }
      }
    }

    /**
     * @name pc.Skeleton#animation
     * @type pc.Animation
     * @description Animation currently assigned to skeleton.
     */
    public get animation(): Animation | null {
      return this._animation;
    }

    public set animation(value: Animation | null) {
      this._animation = value;
      this.currentTime = 0;
    }

    /**
     * @private
     * @deprecated
     * @function
     * @name pc.Skeleton#getAnimation
     * @description Returns the animation currently assigned to the specified skeleton.
     * @returns {pc.Animation} The animation set on the skeleton.
     */
    public getAnimation(): Animation | null {
      return this._animation;
    }

    public get currentTime(): number {
      return this._time;
    }
    public set currentTime(value: number) {
      this._time = value;
      var numNodes: number = this._interpolatedKeys.length;
      for (var i = 0; i < numNodes; i++) {
        var node: InterpolatedKey = this._interpolatedKeys[i];
        var nodeName: string = node._name;
        this._currKeyIndices[nodeName] = 0;
      }

      this.addTime(0);
      this.updateGraph();
    }

    /**
     * @private
     * @deprecated
     * @function
     * @name pc.Skeleton#getCurrentTime
     * @description Returns the current time of the currently active animation as set on
     * the specified skeleton. This value will be between zero and the duration of the
     * animation.
     * @returns {Number} The current time of the animation set on the skeleton.
     */
    public getCurrentTime(): number {
      return this._time;
    }

    /**
     * @private
     * @deprecated
     * @function
     * @name pc.Skeleton#setCurrentTime
     * @description Sets the current time of the currently active animation as set on
     * the specified skeleton. This value must be between zero and the duration of the
     * animation.
     * @param {Number} time The current time of the animation set on the skeleton.
     */
    public setCurrentTime(time: number): void {
      this.currentTime = time;
    }

    /**
     * @readonly
     * @name pc.Skeleton#numNodes
     * @type Number
     * @description Read-only property that returns number of nodes of a skeleton.
     */
    public get numNodes(): number {
      return this._interpolatedKeys.length;
    }

    /**
     * @private
     * @deprecated
     * @function
     * @name pc.Skeleton#getNumNodes
     * @description Returns the number of nodes held by the specified skeleton.
     * @returns {Number} The number of nodes held by the specified skeleton.
     */
    public getNumNodes(): number {
      return this._interpolatedKeys.length;
    }

    /**
     * @private
     * @deprecated
     * @function
     * @name pc.Skeleton#setAnimation
     * @description Sets an animation on the specified skeleton.
     * @param {pc.Animation} animation The animation to set on the skeleton.
     */
    public setAnimation(animation: Animation): void {
      this.animation = animation;
    }

    /**
     * @function
     * @name pc.Skeleton#setGraph
     * @description Links a skeleton to a node hierarchy. The nodes animated skeleton are
     * then subsequently used to drive the local transformation matrices of the node
     * hierarchy.
     * @param {pc.GraphNode} graph The root node of the graph that the skeleton is to drive.
     */
    public setGraph(graph: GraphNode): void {
      var i: number;
      this.graph = graph;

      if (graph) {
        for (i = 0; i < this._interpolatedKeys.length; i++) {
          var interpKey: InterpolatedKey = this._interpolatedKeys[i];
          var graphNode: GraphNode = graph.findByName(interpKey._name);
          this._interpolatedKeys[i].setTarget(graphNode);
        }
      } else {
        for (i = 0; i < this._interpolatedKeys.length; i++) {
          this._interpolatedKeys[i].setTarget(null);
        }
      }
    }

    /**
     * @function
     * @name pc.Skeleton#updateGraph
     * @description Synchronizes the currently linked node hierarchy with the current state of the
     * skeleton. Internally, this function converts the interpolated keyframe at each node in the
     * skeleton into the local transformation matrix at each corresponding node in the linked node
     * hierarchy.
     */
    public updateGraph(): void {
      // stylistic choice
      if (!this.graph) return;

      for (var i = 0; i < this._interpolatedKeys.length; i++) {
        var interpKey = this._interpolatedKeys[i];
        if (interpKey._written) {
          var transform: Node = interpKey.getTarget()!;

          transform.localPosition.copy(interpKey._pos);
          transform.localRotation.copy(interpKey._quat);
          transform.localScale.copy(interpKey._scale);

          if (!transform._dirtyLocal)
            transform._dirtifyLocal();

          interpKey._written = false;
        }
      }
    }

    /**
     * @private
     * @deprecated
     * @function
     * @name pc.Skeleton#setLooping
     * @description Specified whether a skeleton should loop its animation or not. If the animation
     * loops, it will wrap back to the start when adding time to the skeleton beyond the duration
     * of the animation. Otherwise, the animation stops at its end after a single play through.
     * @param {Boolean} looping True to cause the animation to loop back to the start on completion
     * and false otherwise.
     */
    public setLooping(looping: boolean): void {
      this.looping = looping;
    }

    /**
     * @private
     * @deprecated
     * @function
     * @name pc.Skeleton#getLooping
     * @description Queries the specified skeleton to determine whether it is looping its animation.
     * @returns {Boolean} True if the skeleton is looping the animation, false otherwise.
     */
    public getLooping(): boolean {
      return this.looping;
    }
  }
}
