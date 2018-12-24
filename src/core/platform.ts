namespace pc {
    /**
     * @name pc.platform
     * @namespace
     * @description global namespace that stores flags regarding platform environment and features support
     * @example
     * if (pc.platform.touch) {
     *     // touch is supported
     * }
     */
    export class Platform {
        /**
         * @name pc.platform.desktop
         * @description is it a desktop or laptop device
         */
        desktop: boolean;

        /**
         * @name pc.platform.mobile
         * @description is it a mobile or tablet device
         */
        mobile: boolean;

        /**
         * @name pc.platform.ios
         * @description if it is iOS
         */
        ios: boolean;

        /**
         * @name pc.platform.android
         * @description if it is Android
         */
        android: boolean;

        /**
         * @name pc.platform.windows
         * @description if it is Windows
         */
        windows: boolean;

        /**
         * @name pc.platform.cocoonjs
         * @description if it is CocoonJS
         */
        cocoonjs: boolean;

        /**
         * @name pc.platform.xbox
         * @description if it is Xbox
         */
        xbox: boolean;

        /**
         * @name pc.platform.gamepads
         * @description if platform supports gamepads
         */
        gamepads: boolean;

        /**
         * @name pc.platform.touch
         * @description if platform supports touch input
         */
        touch: boolean;

        constructor() {
            this.desktop = false;
            this.mobile = false;
            this.ios = false;
            this.android = false;
            this.windows = false;
            this.cocoonjs = false;
            this.xbox = false;
            this.gamepads = false;
            this.touch = false;

            var ua = navigator.userAgent;

            if (/(windows|mac os|linux|cros)/i.test(ua))
                this.desktop = true;
        
            if (/xbox/i.test(ua))
                this.xbox = true;
        
            if (/(windows phone|iemobile|wpdesktop)/i.test(ua)) {
                this.desktop = false;
                this.mobile = true;
                this.windows = true;
            } else if (/android/i.test(ua)) {
                this.desktop = false;
                this.mobile = true;
                this.android = true;
            } else if (/ip([ao]d|hone)/i.test(ua)) {
                this.desktop = false;
                this.mobile = true;
                this.ios = true;
            }
        
            if ((<any>navigator).isCocoonJS)
                this.cocoonjs = true;
        
            this.touch = 'ontouchstart' in window || ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 0);
        
            this.gamepads = 'getGamepads' in navigator;

        }
    }
    pc.platform = new Platform;
}
