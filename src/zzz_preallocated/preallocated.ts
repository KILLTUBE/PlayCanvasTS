namespace pc {
	export class Preallocated {
		public static tmpSphere = new BoundingSphere;


		// shape/oriented-box.ts
        public static tmpRay = new pc.Ray();
        public static tmpVec3 = new pc.Vec3();
        public static tmpMat4 = new pc.Mat4();
	}
}
