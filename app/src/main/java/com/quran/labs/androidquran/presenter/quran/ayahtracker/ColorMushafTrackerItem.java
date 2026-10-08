package com.quran.labs.androidquran.presenter.quran.ayahtracker;

import android.graphics.RectF;
import android.support.annotation.NonNull;

import com.quran.labs.androidquran.common.AyahBounds;
import com.quran.labs.androidquran.dao.Bookmark;
import com.quran.labs.androidquran.data.SuraAyah;
import com.quran.labs.androidquran.ui.helpers.HighlightType;
import com.quran.labs.androidquran.widgets.AyahToolBar;
import com.quran.labs.androidquran.widgets.ColorMushafPageLayout;

import java.util.List;
import java.util.Map;
import java.util.Set;

public class ColorMushafTrackerItem extends AyahTrackerItem<ColorMushafPageLayout> {
  public ColorMushafTrackerItem(int page, @NonNull ColorMushafPageLayout view) {
    super(page, view);
  }

  @Override
  boolean onHighlightAyah(int page, int sura, int ayah, HighlightType type, boolean scrollToAyah) {
    if (this.page != page) return false;
    if (type == HighlightType.AUDIO) {
      ayahView.clearAudioHighlight();
      ayahView.highlightAyah(sura, ayah);
      return true;
    } else if (type == HighlightType.SELECTION) {
      ayahView.clearSelection();
      ayahView.selectAyat(java.util.Collections.singleton(sura + ":" + ayah));
      if (scrollToAyah) ayahView.revealAyah(sura, ayah);
      return true;
    }
    return false;
  }

  @Override
  void onUnHighlightAyah(int page, int sura, int ayah, HighlightType type) {
    if (this.page == page && type == HighlightType.AUDIO) {
      ayahView.clearAudioHighlight();
    } else if (this.page == page && type == HighlightType.SELECTION) {
      ayahView.clearSelection();
    }
  }

  @Override
  void onUnHighlightAyahType(HighlightType type) {
    if (type == HighlightType.AUDIO) {
      ayahView.clearAudioHighlight();
    } else if (type == HighlightType.SELECTION) {
      ayahView.clearSelection();
    }
  }

  @Override
  void onSetAyahBookmarks(@NonNull List<Bookmark> bookmarks) {
    // Keep bookmark rendering unchanged in the original Mushaf mode.
  }

  @Override
  void onSetPageBounds(int page, @NonNull RectF bounds) {
  }

  @Override
  void onSetAyahCoordinates(int page, @NonNull Map<String, List<AyahBounds>> coordinates) {
  }

  @Override
  void onHighlightAyat(int page, Set<String> ayahKeys, HighlightType type) {
    if (this.page == page && type == HighlightType.SELECTION) {
      ayahView.selectAyat(ayahKeys);
    }
  }

  @Override
  AyahToolBar.AyahToolBarPosition getToolBarPosition(int page, int sura, int ayah,
                                                     int toolBarWidth, int toolBarHeight) {
    return this.page == page ?
        ayahView.getToolBarPosition(sura, ayah, toolBarWidth, toolBarHeight) : null;
  }

  @Override
  SuraAyah getAyahForPosition(int page, float x, float y) {
    return null;
  }
}
