namespace pc {
    export class AllocatePool {
        _constructor: any;
        _pool: any[];
        _count: number;

        constructor(constructor_: any, size: number) {
            this._constructor = constructor_;
            this._pool = [];
            this._count = 0;

            this._resize(size);
        };

        _resize(size: number): void {
            if (size > this._pool.length) {
                for (var i = this._pool.length; i < size; i++) {
                    this._pool[i] = new this._constructor();
                }
            }
        }

        allocate(): void {
            if (this._count >= this._pool.length) {
                this._resize(this._pool.length * 2);
            }
            return this._pool[this._count++];
        }

        freeAll(): void {
            this._count = 0;
        }
    }
}
