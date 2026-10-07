package com.quran.labs.androidquran.util;

import android.support.annotation.Nullable;

/**
 * A user selectable page theme: one background colour and one text colour.
 *
 * The Quran page images are black text on a white page. Mapping white to the background colour
 * and black to the text colour (per channel) recolours the page without moving a single pixel,
 * so the ayah coordinates used for highlighting stay valid.
 */
public final class PageTheme {
  public final int background;
  public final int text;

  private PageTheme(int background, int text) {
    this.background = background;
    this.text = text;
  }

  /** Returns the theme for a preference value, or null for the default black and white page. */
  @Nullable
  public static PageTheme fromKey(@Nullable String key) {
    if (key == null) {
      return null;
    }
    switch (key) {
      case "sepia":
        return new PageTheme(0xFFF4ECD8, 0xFF5B4636);
      case "cream":
        return new PageTheme(0xFFFFF8E7, 0xFF2B2B2B);
      case "green":
        return new PageTheme(0xFFE8F3EE, 0xFF1B4D3E);
      case "gray":
        return new PageTheme(0xFFE6E6E6, 0xFF1A1A1A);
      case "blue":
        return new PageTheme(0xFFE8F0FA, 0xFF14284B);
      default:
        return null;
    }
  }

  /** A 4x5 colour matrix: white maps to the background colour and black maps to the text colour. */
  public float[] toColorMatrix() {
    final float[] m = new float[20];
    final int[] shifts = {16, 8, 0};
    for (int i = 0; i < 3; i++) {
      final int b = (background >> shifts[i]) & 0xFF;
      final int t = (text >> shifts[i]) & 0xFF;
      m[i * 5 + i] = (b - t) / 255f;
      m[i * 5 + 4] = t;
    }
    m[18] = 1f;
    return m;
  }
}
