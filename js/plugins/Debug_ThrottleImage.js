/*:
 * @plugindesc Throttle loading images.
 * @author RM CoreScript team
 *
 * @help
 * This plugin throttle loading.
 * Loading image is delayed by Delay parameter(in ms)
 *
 * @param Delay
 * @default 2000
 */

(function(){
    var parameters = PluginManager.parameters('Debug_ThrottleImage');
    var delay = +parameters['Delay'] || 2000;

    var Bitmap_prototype_onLoad = Bitmap.prototype._onLoad;
    Bitmap.prototype._onLoad = function(){
        setTimeout(Bitmap_prototype_onLoad.bind(this), delay);
    }
})();