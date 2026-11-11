package com.uneviejeu.simulation;

import android.app.Activity;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.unity3d.ads.IUnityAdsInitializationListener;
import com.unity3d.ads.IUnityAdsLoadListener;
import com.unity3d.ads.IUnityAdsShowListener;
import com.unity3d.ads.UnityAds;
import com.unity3d.ads.UnityAdsShowOptions;

/** Pont entre le jeu (JavaScript) et le SDK Unity Ads. */
@CapacitorPlugin(name = "UnityAds")
public class UnityAdsPlugin extends Plugin {

    @PluginMethod
    public void init(final PluginCall call) {
        final String gameId = call.getString("gameId");
        final boolean test = call.getBoolean("test", true);
        if (gameId == null || gameId.isEmpty()) {
            call.reject("gameId manquant");
            return;
        }
        if (UnityAds.isInitialized()) {
            JSObject r = new JSObject();
            r.put("ok", true);
            call.resolve(r);
            return;
        }
        UnityAds.initialize(getContext().getApplicationContext(), gameId, test, new IUnityAdsInitializationListener() {
            @Override
            public void onInitializationComplete() {
                JSObject r = new JSObject();
                r.put("ok", true);
                call.resolve(r);
            }

            @Override
            public void onInitializationFailed(UnityAds.UnityAdsInitializationError error, String message) {
                call.reject("init: " + message);
            }
        });
    }

    /** Charge puis affiche une pub. Résout {completed:true} si la pub a été regardée jusqu'au bout. */
    @PluginMethod
    public void showAd(final PluginCall call) {
        final String placement = call.getString("placement");
        if (placement == null || placement.isEmpty()) {
            call.reject("placement manquant");
            return;
        }
        UnityAds.load(placement, new IUnityAdsLoadListener() {
            @Override
            public void onUnityAdsAdLoaded(final String placementId) {
                final Activity activity = getActivity();
                if (activity == null) {
                    call.reject("pas d'activité");
                    return;
                }
                activity.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        UnityAds.show(activity, placementId, new UnityAdsShowOptions(), new IUnityAdsShowListener() {
                            @Override
                            public void onUnityAdsShowFailure(String id, UnityAds.UnityAdsShowError error, String message) {
                                call.reject("show: " + message);
                            }

                            @Override
                            public void onUnityAdsShowStart(String id) {
                            }

                            @Override
                            public void onUnityAdsShowClick(String id) {
                            }

                            @Override
                            public void onUnityAdsShowComplete(String id, UnityAds.UnityAdsShowCompletionState state) {
                                JSObject r = new JSObject();
                                r.put("completed", state == UnityAds.UnityAdsShowCompletionState.COMPLETED);
                                call.resolve(r);
                            }
                        });
                    }
                });
            }

            @Override
            public void onUnityAdsFailedToLoad(String id, UnityAds.UnityAdsLoadError error, String message) {
                call.reject("load: " + message);
            }
        });
    }
}
