package com.crashlytics.android;

/** Lightweight compatibility shim for the retired Fabric Crashlytics SDK. */
public class Crashlytics {
  public static void log(String message) { }
  public static void log(int priority, String tag, String message) { }
  public static void logException(Throwable throwable) { }

  public static class Builder {
    public Builder core(Object core) { return this; }
    public Crashlytics build() { return new Crashlytics(); }
  }
}
