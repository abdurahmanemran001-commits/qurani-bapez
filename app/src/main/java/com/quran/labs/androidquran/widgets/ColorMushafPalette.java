package com.quran.labs.androidquran.widgets;

import android.graphics.Color;
import android.support.annotation.NonNull;

import com.quran.labs.androidquran.util.QuranSettings;

import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Colors used by the SVG based "Color Mushaf". All values are ARGB ints (alpha ignored).
 */
public final class ColorMushafPalette {
  public static final String THEME_CLASSIC = "classic";
  public static final String THEME_PAPER = "paper";
  public static final String THEME_SEPIA = "sepia";
  public static final String THEME_NIGHT = "night";
  public static final String THEME_MIDNIGHT = "midnight";
  public static final String THEME_CUSTOM = "custom";

  private static final Pattern HEX = Pattern.compile("^#?([0-9a-fA-F]{6})$");

  public final int text;
  public final int marker;
  public final int background;
  public final int highlight;

  public ColorMushafPalette(int text, int marker, int background, int highlight) {
    this.text = text;
    this.marker = marker;
    this.background = background;
    this.highlight = highlight;
  }

  public static boolean isValidHex(String value) {
    return value != null && HEX.matcher(value.trim()).matches();
  }

  /** Parses "#RRGGBB" or "RRGGBB"; returns fallback when invalid. */
  public static int parse(String value, int fallback) {
    if (!isValidHex(value)) {
      return fallback;
    }
    return 0xFF000000 | Integer.parseInt(HEX.matcher(value.trim()).replaceAll("$1"), 16);
  }

  @NonNull
  public static String hex(int color) {
    return String.format(Locale.US, "#%06X", color & 0xFFFFFF);
  }

  public boolean isDark() {
    // perceived luminance of the background
    double l = 0.299 * Color.red(background) + 0.587 * Color.green(background)
        + 0.114 * Color.blue(background);
    return l < 128;
  }

  @NonNull
  public static ColorMushafPalette forTheme(String theme) {
    if (THEME_PAPER.equals(theme)) {
      return new ColorMushafPalette(0xFF1A1A1A, 0xFF1A1A1A, 0xFFFFFFFF, 0xFFFFE082);
    } else if (THEME_SEPIA.equals(theme)) {
      return new ColorMushafPalette(0xFF3B2A1A, 0xFF8B5E34, 0xFFF4ECD8, 0xFFE6C98F);
    } else if (THEME_NIGHT.equals(theme)) {
      return new ColorMushafPalette(0xFFE8E6E1, 0xFFD4AF37, 0xFF0D0F12, 0xFF3D6B5C);
    } else if (THEME_MIDNIGHT.equals(theme)) {
      return new ColorMushafPalette(0xFFDCE6F5, 0xFF7FB2FF, 0xFF0B1B33, 0xFF2E5C99);
    }
    return new ColorMushafPalette(0xFF173F35, 0xFF8A6B24, 0xFFFFFFFF, 0xFFB7E4D0);
  }

  @NonNull
  public static ColorMushafPalette fromSettings(@NonNull QuranSettings settings) {
    final String theme = settings.getColorMushafTheme();
    ColorMushafPalette base = forTheme(THEME_CUSTOM.equals(theme) ? THEME_CLASSIC : theme);
    if (THEME_CUSTOM.equals(theme)) {
      base = new ColorMushafPalette(
          parse(settings.getColorMushafColor(
              com.quran.labs.androidquran.data.Constants.PREF_COLOR_MUSHAF_TEXT), base.text),
          parse(settings.getColorMushafColor(
              com.quran.labs.androidquran.data.Constants.PREF_COLOR_MUSHAF_MARKER), base.marker),
          parse(settings.getColorMushafColor(
              com.quran.labs.androidquran.data.Constants.PREF_COLOR_MUSHAF_BACKGROUND),
              base.background),
          parse(settings.getColorMushafColor(
              com.quran.labs.androidquran.data.Constants.PREF_COLOR_MUSHAF_HIGHLIGHT),
              base.highlight));
    } else if (settings.isNightMode() && !base.isDark()) {
      base = forTheme(THEME_NIGHT);
    }
    return base;
  }

  /** Fills the placeholders of color_mushaf.css. */
  @NonNull
  public String buildCss(@NonNull String template) {
    final boolean dark = isDark();
    return template
        .replace("{{BACKGROUND}}", hex(background))
        .replace("{{TEXT}}", hex(text))
        .replace("{{MARKER}}", hex(marker))
        .replace("{{HIGHLIGHT}}", hex(highlight))
        .replace("{{HIGHLIGHT_OPACITY}}", dark ? "0.45" : "0.6")
        .replace("{{HIGHLIGHT_BLEND}}", dark ? "normal" : "multiply");
  }
}
