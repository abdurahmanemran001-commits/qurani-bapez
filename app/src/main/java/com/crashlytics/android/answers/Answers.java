package com.crashlytics.android.answers;

/** No-op compatibility shim for retired Fabric Answers analytics. */
public class Answers {
  private static final Answers INSTANCE = new Answers();
  public static Answers getInstance() { return INSTANCE; }
  public void logCustom(CustomEvent event) { }
}
