package com.uneviejeu.simulation;

import android.app.Activity;

import androidx.annotation.NonNull;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.interstitial.InterstitialAd;
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback;
import com.google.android.gms.ads.rewarded.RewardedAd;
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback;

/** Pont entre le jeu (JavaScript) et Google AdMob. */
@CapacitorPlugin(name = "AdmobBridge")
public class AdmobPlugin extends Plugin {
    private boolean started = false;

    @PluginMethod
    public void init(final PluginCall call) {
        if (!started) {
            MobileAds.initialize(getContext().getApplicationContext(), status -> { });
            started = true;
        }
        JSObject r = new JSObject();
        r.put("ok", true);
        call.resolve(r);
    }

    /** type = "rewarded" ou "inter". Résout {completed:true} si la récompense est gagnée (rewarded) ou la pub affichée (inter). */
    @PluginMethod
    public void showAd(final PluginCall call) {
        final String unit = call.getString("unit");
        final String type = call.getString("type", "inter");
        final Activity activity = getActivity();
        if (unit == null || unit.isEmpty()) { call.reject("unit manquant"); return; }
        if (activity == null) { call.reject("pas d'activité"); return; }
        activity.runOnUiThread(() -> {
            AdRequest req = new AdRequest.Builder().build();
            if ("rewarded".equals(type)) {
                RewardedAd.load(activity, unit, req, new RewardedAdLoadCallback() {
                    @Override
                    public void onAdLoaded(@NonNull final RewardedAd ad) {
                        final boolean[] earned = { false };
                        ad.setFullScreenContentCallback(new FullScreenContentCallback() {
                            @Override
                            public void onAdDismissedFullScreenContent() {
                                JSObject r = new JSObject();
                                r.put("completed", earned[0]);
                                call.resolve(r);
                            }

                            @Override
                            public void onAdFailedToShowFullScreenContent(@NonNull AdError e) {
                                call.reject("show: " + e.getMessage());
                            }
                        });
                        ad.show(activity, item -> earned[0] = true);
                    }

                    @Override
                    public void onAdFailedToLoad(@NonNull LoadAdError e) {
                        call.reject("load: " + e.getMessage());
                    }
                });
            } else {
                InterstitialAd.load(activity, unit, req, new InterstitialAdLoadCallback() {
                    @Override
                    public void onAdLoaded(@NonNull final InterstitialAd ad) {
                        ad.setFullScreenContentCallback(new FullScreenContentCallback() {
                            @Override
                            public void onAdDismissedFullScreenContent() {
                                JSObject r = new JSObject();
                                r.put("completed", true);
                                call.resolve(r);
                            }

                            @Override
                            public void onAdFailedToShowFullScreenContent(@NonNull AdError e) {
                                call.reject("show: " + e.getMessage());
                            }
                        });
                        ad.show(activity);
                    }

                    @Override
                    public void onAdFailedToLoad(@NonNull LoadAdError e) {
                        call.reject("load: " + e.getMessage());
                    }
                });
            }
        });
    }
}
