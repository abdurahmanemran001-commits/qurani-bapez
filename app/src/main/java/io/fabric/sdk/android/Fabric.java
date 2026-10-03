package io.fabric.sdk.android;

/** Lightweight compatibility shim for the retired Fabric SDK. */
public final class Fabric {
  private Fabric() { }
  public static Object with(Object context, Object kit) { return kit; }
}
