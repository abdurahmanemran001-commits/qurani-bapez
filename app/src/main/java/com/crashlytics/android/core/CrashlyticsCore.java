package com.crashlytics.android.core;

/** Lightweight compatibility shim for the retired Fabric Crashlytics SDK. */
public class CrashlyticsCore {
  public static class Builder {
    public Builder disabled(boolean disabled) { return this; }
    public CrashlyticsCore build() { return new CrashlyticsCore(); }
  }
}
