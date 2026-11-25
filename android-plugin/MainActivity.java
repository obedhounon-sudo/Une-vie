package com.obedklein.uneviejeu;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(UnityAdsPlugin.class);
        registerPlugin(AdmobPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
