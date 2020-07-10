export class GizmosManager {

    public static mode: number = 0;
    private static gizmoManager: BABYLON.GizmoManager;


    public constructor() {

    }

    public static init(scene: BABYLON.Scene) {
        this.gizmoManager = new BABYLON.GizmoManager(scene);
    }

    public static setMode(m: number): void {
        this.mode = m;
        if(this.mode == 0) {
            this.gizmoManager.positionGizmoEnabled = true;
            this.gizmoManager.rotationGizmoEnabled = false;
            this.gizmoManager.scaleGizmoEnabled = false;
        } else if(this.mode === 1) {
            this.gizmoManager.positionGizmoEnabled = false;
            this.gizmoManager.rotationGizmoEnabled = true;
            this.gizmoManager.scaleGizmoEnabled = false;
        } else {
            this.gizmoManager.positionGizmoEnabled = false;
            this.gizmoManager.rotationGizmoEnabled = false;
            this.gizmoManager.scaleGizmoEnabled = true;
        }
    }

    public static attach(mesh: Nullable<BABYLON.AbstractMesh>): void {
        this.gizmoManager.attachToMesh(mesh);
        this.setMode(this.mode);
    }

    public static clear(): void {
        this.gizmoManager.attachToMesh(null);
    }



}