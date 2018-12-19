namespace pc {
  export interface INodeDictionary {
    [key: string]: Node;
  }

  export class Key {
    public time: number;
    public position: Vec3;
    public rotation: Quat;
    public scale: Vec3;
    constructor(time: number, position: Vec3, rotation: Quat, scale: Vec3) {
      this.time = time;
      this.position = position;
      this.rotation = rotation;
      this.scale = scale;
    }
  }

  /**
   * @constructor
   * @name pc.Node
   * @classdesc A animation node has a name and contains an array of keyframes.
   * @description Create a new animation node.
   */
  export class Node {
    public _name: string = "";
    public _keys: Key[] = [];
  }

  export class Animation {
    public name: string = "";
    public duration: number = 0;
    public _nodes: Node[] = [];
    public _nodeDict: INodeDictionary = {};

    /**
     * @private
     * @deprecated
     * @function
     * @name pc.Animation#getDuration
     * @description Returns the duration of the animation in seconds.
     * @returns {Number} The duration of the animation in seconds.
     */
    public getDuration(): number {
      return this.duration;
    }

    /**
     * @private
     * @deprecated
     * @function
     * @name pc.Animation#getName
     * @description Returns the human-readable name of the animation.
     * @returns {String} The name of the animation.
     */
    public getName(): string {
      return this.name;
    };

    /**
     * @function
     * @name pc.Animation#getNode
     * @description Gets a {@link pc.Node} by name
     * @param {String} name The name of the pc.Node
     * @returns {pc.Node} The pc.Node with the specified name
     */
    public getNode(name: string): Node | undefined {
      return this._nodeDict[name];
    }

    /**
     * @readonly
     * @name pc.Animation#nodes
     * @type pc.Node[]
     * @description A read-only property to get array of animation nodes
     */
    public get nodes(): Node[] {
      return this._nodes;
    }

    /**
     * @private
     * @deprecated
     * @function
     * @name pc.Animation#getNodes
     * @description Gets the {@link pc.Node}s of this {@link pc.Animation}
     * @returns {pc.Node[]} An array of nodes.
     */
    public getNodes(): Node[] {
      return this._nodes;
    }

    /**
     * @private
     * @deprecated
     * @function
     * @name pc.Animation#setDuration
     * @description Sets the duration of the specified animation in seconds.
     * @param {Number} duration The duration of the animation in seconds.
     */
    public setDuration(duration: number): void {
      this.duration = duration;
    }

    /**
     * @private
     * @deprecated
     * @function
     * @name pc.Animation#setName
     * @description Sets the human-readable name of the specified animation.
     * @param {String} name The new name for the animation.
     */
    public setName(name: string): void {
      this.name = name;
    }

    /**
     * @function
     * @name pc.Animation#addNode
     * @description Adds a node to the internal nodes array.
     * @param {pc.Node} node The node to add.
     */
    public addNode(node: Node): void {
      this._nodes.push(node);
      this._nodeDict[node._name] = node;
    }
  }
}
