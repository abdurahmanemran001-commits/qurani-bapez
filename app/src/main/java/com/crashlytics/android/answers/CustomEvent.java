package com.crashlytics.android.answers;

/** No-op compatibility shim for retired Fabric Answers analytics events. */
public class CustomEvent {
  private final String name;
  public CustomEvent(String name) { this.name = name; }
  public CustomEvent putCustomAttribute(String key, String value) { return this; }
  public CustomEvent putCustomAttribute(String key, Number value) { return this; }
}
