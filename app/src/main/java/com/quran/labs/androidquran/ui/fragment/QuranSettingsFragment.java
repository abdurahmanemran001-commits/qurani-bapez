package com.quran.labs.androidquran.ui.fragment;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.preference.ListPreference;
import android.preference.Preference;
import android.preference.PreferenceCategory;
import android.preference.PreferenceFragment;
import android.preference.PreferenceScreen;
import android.widget.Toast;

import com.quran.labs.androidquran.QuranAdvancedPreferenceActivity;
import com.quran.labs.androidquran.QuranApplication;
import com.quran.labs.androidquran.QuranPreferenceActivity;
import com.quran.labs.androidquran.R;
import com.quran.labs.androidquran.data.Constants;
import com.quran.labs.androidquran.model.bookmark.BookmarkImportExportModel;
import com.quran.labs.androidquran.ui.AudioManagerActivity;
import com.quran.labs.androidquran.ui.TranslationManagerActivity;
import com.quran.labs.androidquran.util.QuranScreenInfo;
import com.quran.labs.androidquran.widgets.ColorMushafPalette;

import javax.inject.Inject;

public class QuranSettingsFragment extends PreferenceFragment implements
    SharedPreferences.OnSharedPreferenceChangeListener {
  @Inject BookmarkImportExportModel bookmarkImportExportModel;

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    addPreferencesFromResource(R.xml.quran_preferences);

    final Context context = getActivity();
    Context mAppContext = context.getApplicationContext();

    // field injection
    ((QuranApplication) mAppContext).getApplicationComponent().inject(this);

    // handle translation manager click
    final Preference translationPref = findPreference(Constants.PREF_TRANSLATION_MANAGER);
    translationPref.setOnPreferenceClickListener(new Preference.OnPreferenceClickListener() {
      @Override
      public boolean onPreferenceClick(Preference preference) {
        startActivity(new Intent(getActivity(), TranslationManagerActivity.class));
        return true;
      }
    });

    // handle audio manager click
    final Preference audioManagerPref = findPreference(Constants.PREF_AUDIO_MANAGER);
    audioManagerPref.setOnPreferenceClickListener(new Preference.OnPreferenceClickListener() {
      @Override
      public boolean onPreferenceClick(Preference preference) {
        startActivity(new Intent(getActivity(), AudioManagerActivity.class));
        return true;
      }
    });

    setupColorMushafPreferences();
  }

  private void setupColorMushafPreferences() {
    final String[] colorKeys = {
        Constants.PREF_COLOR_MUSHAF_TEXT,
        Constants.PREF_COLOR_MUSHAF_MARKER,
        Constants.PREF_COLOR_MUSHAF_BACKGROUND,
        Constants.PREF_COLOR_MUSHAF_HIGHLIGHT
    };
    for (String key : colorKeys) {
      final Preference colorPref = findPreference(key);
      if (colorPref == null) {
        continue;
      }
      colorPref.setOnPreferenceChangeListener((preference, newValue) -> {
        final String value = newValue == null ? "" : newValue.toString().trim();
        if (value.isEmpty() || ColorMushafPalette.isValidHex(value)) {
          return true;
        }
        Toast.makeText(getActivity(), R.string.prefs_color_mushaf_invalid_color,
            Toast.LENGTH_SHORT).show();
        return false;
      });
    }

    final Preference themePref = findPreference(Constants.PREF_COLOR_MUSHAF_THEME);
    if (themePref != null) {
      updateCustomColorPrefs(((ListPreference) themePref).getValue());
      themePref.setOnPreferenceChangeListener((preference, newValue) -> {
        updateCustomColorPrefs(String.valueOf(newValue));
        return true;
      });
    }
  }

  private void updateCustomColorPrefs(String theme) {
    final boolean custom = ColorMushafPalette.THEME_CUSTOM.equals(theme);
    final String[] colorKeys = {
        Constants.PREF_COLOR_MUSHAF_TEXT,
        Constants.PREF_COLOR_MUSHAF_MARKER,
        Constants.PREF_COLOR_MUSHAF_BACKGROUND,
        Constants.PREF_COLOR_MUSHAF_HIGHLIGHT
    };
    for (String key : colorKeys) {
      final Preference colorPref = findPreference(key);
      if (colorPref != null) {
        colorPref.setEnabled(custom);
      }
    }
  }

  @Override
  public void onResume() {
    super.onResume();
    getPreferenceScreen().getSharedPreferences()
        .registerOnSharedPreferenceChangeListener(this);
  }

  @Override
  public void onPause() {
    getPreferenceScreen().getSharedPreferences()
        .unregisterOnSharedPreferenceChangeListener(this);
    super.onPause();
  }

  @Override
  public void onSharedPreferenceChanged(SharedPreferences sharedPreferences,
                                        String key) {
    if (key.equals(Constants.PREF_USE_ARABIC_NAMES)) {
      final Context context = getActivity();
      if (context instanceof QuranPreferenceActivity) {
        ((QuranPreferenceActivity) context).restartActivity();
      }
    }
  }

  @Override
  public boolean onPreferenceTreeClick(PreferenceScreen preferenceScreen, Preference preference) {
    final String key = preference.getKey();
    if ("key_prefs_advanced".equals(key)) {
      Intent intent = new Intent(getActivity(), QuranAdvancedPreferenceActivity.class);
      startActivity(intent);
      return true;
    }

    return super.onPreferenceTreeClick(preferenceScreen, preference);
  }
}
