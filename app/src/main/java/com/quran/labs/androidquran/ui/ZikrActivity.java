package com.quran.labs.androidquran.ui;

import android.graphics.Color;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.AsyncTask;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.support.v7.app.ActionBar;
import android.support.v7.app.AppCompatActivity;
import android.view.Gravity;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.ProgressBar;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import com.quran.labs.androidquran.R;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Locale;

/**
 * Azkar screen. Uses the same azkar.json as the web version (built by tools/build_azkar.py), so the
 * app and the site always show the same categories, counts and recordings.
 */
public class ZikrActivity extends AppCompatActivity {
  private static final String[] LANGUAGES = {"ckb", "bad"};
  private static final String[] LANGUAGE_LABELS = {"کوردیی سۆرانی", "کوردیی بادینی"};

  private LinearLayout root;
  private ListView categoryList;
  private ProgressBar progress;
  private JSONArray data;
  private int languageIndex = 0;
  private int currentCategory = -1;

  @Override protected void onCreate(Bundle state) {
    super.onCreate(state);
    setContentView(R.layout.activity_zikr);
    root = findViewById(R.id.zikr_root);
    categoryList = findViewById(R.id.zikr_categories);
    progress = findViewById(R.id.zikr_progress);
    ActionBar bar = getSupportActionBar();
    if (bar != null) {
      bar.setTitle(R.string.zikr_title);
      bar.setDisplayHomeAsUpEnabled(true);
    }
    new LoadTask().execute();
  }

  @Override public boolean onOptionsItemSelected(MenuItem item) {
    if (item.getItemId() == android.R.id.home) { finish(); return true; }
    return super.onOptionsItemSelected(item);
  }

  private class LoadTask extends AsyncTask<Void, Void, Boolean> {
    private String error;
    @Override protected Boolean doInBackground(Void... unused) {
      try (InputStream in = getAssets().open("azkar.json")) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buffer = new byte[32768];
        int count;
        while ((count = in.read(buffer)) != -1) out.write(buffer, 0, count);
        data = new JSONArray(new String(out.toByteArray(), "UTF-8"));
        return data.length() > 0;
      } catch (Exception e) { error = e.getMessage(); return false; }
    }
    @Override protected void onPostExecute(Boolean ok) {
      progress.setVisibility(View.GONE);
      if (ok) showCategories();
      else Toast.makeText(ZikrActivity.this,
          "زیکرەکان نەکرا بکرێنەوە: " + (error == null ? "" : error), Toast.LENGTH_LONG).show();
    }
  }

  private String language() { return LANGUAGES[languageIndex]; }

  /** Name/text in the selected language, falling back to Sorani, then Arabic. */
  private String pick(JSONObject o, String key) {
    String v = o.optString(key, "");
    if (v.trim().isEmpty()) v = o.optString("ckb", "");
    if (v.trim().isEmpty()) v = o.optString("ar", "");
    return v;
  }

  private void showCategories() {
    stopAudio();
    currentCategory = -1;
    root.removeAllViews();
    addLanguageSwitch();
    ScrollView scroll = new ScrollView(this);
    LinearLayout list = column();
    for (int i = 0; i < data.length(); i++) {
      final int index = i;
      JSONObject c = data.optJSONObject(i);
      if (c == null) continue;
      addRow(list, pick(c, language()), "›", () -> showChapters(index));
    }
    scroll.addView(list);
    root.addView(scroll, new LinearLayout.LayoutParams(-1, 0, 1));
  }

  private void addLanguageSwitch() {
    Button switcher = new Button(this);
    switcher.setText("زمان: " + LANGUAGE_LABELS[languageIndex] + "  ↻");
    switcher.setOnClickListener(v -> {
      languageIndex = (languageIndex + 1) % LANGUAGES.length;
      showCategories();
    });
    root.addView(switcher, new LinearLayout.LayoutParams(-1, -2));
  }

  private void showChapters(final int categoryIndex) {
    stopAudio();
    currentCategory = categoryIndex;
    JSONObject category = data.optJSONObject(categoryIndex);
    if (category == null) return;
    final String title = pick(category, language());
    root.removeAllViews();
    addBack("‹  هەموو بەشەکان", this::showCategories);
    addHeading(title);
    ScrollView scroll = new ScrollView(this);
    LinearLayout list = column();
    JSONArray chapters = category.optJSONArray("chapters");
    for (int i = 0; chapters != null && i < chapters.length(); i++) {
      final int chapterIndex = i;
      JSONObject chapter = chapters.optJSONObject(i);
      if (chapter == null) continue;
      JSONArray items = chapter.optJSONArray("items");
      String name = pick(chapter, language()) + "  (" + (items == null ? 0 : items.length()) + ")";
      addRow(list, name, "›", () -> showItems(categoryIndex, chapterIndex));
    }
    scroll.addView(list);
    root.addView(scroll, new LinearLayout.LayoutParams(-1, 0, 1));
  }

  // ---- entries -------------------------------------------------------------
  private static class Entry {
    String title; String arabic; String translation; String reference;
    int target = 1;
    String[] audio; // full mp3 urls, null -> device speech
  }

  private Entry entryFrom(JSONObject it) {
    Entry e = new Entry();
    e.title = it.optString("title", "").trim();
    e.arabic = it.optString("ar", "").trim();
    e.translation = pick(it, language()).trim();
    if (e.translation.equals(e.arabic)) e.translation = "";
    e.reference = it.optString("ref", "").trim();
    e.target = Math.max(1, it.optInt("repeat", 1));
    ArrayList<String> urls = new ArrayList<>();
    JSONArray ay = it.optJSONArray("ayah");
    for (int i = 0; ay != null && i < ay.length(); i++) urls.add(ay.optString(i));
    if (urls.isEmpty()) {
      String single = it.optString("audio", "");
      if (!single.isEmpty()) urls.add(single);
    }
    if (!urls.isEmpty()) e.audio = urls.toArray(new String[0]);
    return e;
  }

  private static final String ALL_LABEL = "▶  هەمووی بخوێنەوە (عەرەبی + کوردی)";

  private void showItems(final int categoryIndex, int chapterIndex) {
    stopAudio();
    JSONObject category = data.optJSONObject(categoryIndex);
    JSONArray chapters = category == null ? null : category.optJSONArray("chapters");
    JSONObject chapter = chapters == null ? null : chapters.optJSONObject(chapterIndex);
    if (chapter == null) return;
    final String categoryTitle = pick(category, language());
    final String chapterKey = chapter.optString("ckb", "").trim();
    root.removeAllViews();
    addBack("‹  " + categoryTitle, () -> showChapters(categoryIndex));
    addHeading(pick(chapter, language()));
    ScrollView scroll = new ScrollView(this);
    LinearLayout list = column();
    final ArrayList<Entry> cards = new ArrayList<>();
    JSONArray items = chapter.optJSONArray("items");
    for (int i = 0; items != null && i < items.length(); i++) {
      JSONObject it = items.optJSONObject(i);
      if (it != null) cards.add(entryFrom(it));
    }
    final ArrayList<View> views = new ArrayList<>();
    final Button all = new Button(this);
    all.setText(ALL_LABEL);
    all.setOnClickListener(v -> {
      if (allOn) { stopAudio(); return; }
      playAll(all, cards, views);
    });
    final String video = videoFor(chapterKey);
    if (video != null) {
      Button watch = new Button(this);
      watch.setText("▶  بینینی ڤیدیۆ (NRT لە یوتوب)");
      watch.setOnClickListener(v -> {
        stopAudio();
        try {
          startActivity(new android.content.Intent(android.content.Intent.ACTION_VIEW,
              android.net.Uri.parse("https://www.youtube.com/watch?v=" + video)));
        } catch (Exception ex) {
          Toast.makeText(this, "نەتوانرا یوتوب بکرێتەوە", Toast.LENGTH_LONG).show();
        }
      });
      list.addView(watch);
    }
    final String longUrl = longAudioFor(chapterKey);
    if (longUrl != null) {
      final Button longBtn = new Button(this);
      final String label = "🎧  گوێگرتن بە دەنگی " + longNameFor(chapterKey);
      longBtn.setText(label);
      longBtn.setOnClickListener(v -> {
        if (playingButton == longBtn) { stopAudio(); return; }
        stopAudio();
        playingButton = longBtn;
        playingLabel = label;
        longBtn.setText("■  وەستاندن");
        playLong(longUrl);
      });
      list.addView(longBtn);
      TextView credit = new TextView(this);
      credit.setText("دەنگ: " + longNameFor(chapterKey) + " (بە مۆڵەتی خۆی)");
      credit.setTextSize(12);
      credit.setTextColor(Color.DKGRAY);
      list.addView(credit);
    }
    list.addView(all);
    int number = 0;
    for (Entry e : cards) {
      number++;
      View card = buildCard(e, number);
      views.add(card);
      list.addView(card, cardParams());
    }
    allScroll = scroll;
    scroll.addView(list);
    root.addView(scroll, new LinearLayout.LayoutParams(-1, 0, 1));
  }

  /** Official YouTube videos (opened in YouTube, nothing is copied). Keyed by Sorani chapter name. */
  private static String videoFor(String chapter) {
    if ("ویردەکانی بەیانیان".equals(chapter)) return "tSIDOt0bg74";
    if ("ویردەکانی ئێواران".equals(chapter)) return "uihTLgzqFAs";
    return null;
  }

  private static final String REL = "https://github.com/abdurahmanemran001-commits/qurani-bapez/releases/download/zikr-audio/";

  /** Full recordings used with the reciters' permission. */
  private static String longAudioFor(String chapter) {
    if ("ویردەکانی بەیانیان".equals(chapter)) return REL + "morning.mp3";
    if ("ویردەکانی ئێواران".equals(chapter)) return REL + "evening.mp3";
    if ("ویردەکانی خەوتن".equals(chapter)) return REL + "sleep.mp3";
    return null;
  }

  private static String longNameFor(String chapter) {
    if ("ویردەکانی ئێواران".equals(chapter)) return "هەڵۆ ئەمین";
    if ("ویردەکانی خەوتن".equals(chapter)) return "عمر عبداللە";
    return "بێشەوا قادر ئەلکوردی";
  }

  private void playLong(String url) {
    final Button owner = playingButton;
    try {
      player = new MediaPlayer();
      player.setAudioStreamType(AudioManager.STREAM_MUSIC);
      player.setDataSource(url);
      player.setOnPreparedListener(MediaPlayer::start);
      player.setOnCompletionListener(mp -> { if (playingButton == owner) stopAudio(); });
      player.setOnErrorListener((mp, what, extra) -> {
        if (playingButton == owner) {
          stopAudio();
          Toast.makeText(ZikrActivity.this, "ئینتەرنێت بپشکنە بۆ گوێگرتن", Toast.LENGTH_LONG).show();
        }
        return true;
      });
      player.prepareAsync();
    } catch (Exception ex) {
      stopAudio();
      Toast.makeText(this, "نەتوانرا دەنگەکە بکرێتەوە", Toast.LENGTH_LONG).show();
    }
  }

  private LinearLayout.LayoutParams cardParams() {
    LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(-1, -2);
    p.setMargins(0, 0, 0, 16);
    return p;
  }

  private View buildCard(final Entry e, int number) {
    LinearLayout card = column();
    card.setPadding(18, 18, 18, 18);
    card.setBackgroundColor(Color.WHITE);
    TextView num = new TextView(this);
    String heading = "زیکر " + number + (e.title.isEmpty() ? "" : " · " + e.title);
    num.setText(heading);
    num.setTextSize(15);
    num.setTextColor(Color.parseColor("#1B5E20"));
    card.addView(num);
    TextView arabic = new TextView(this);
    arabic.setText(e.arabic);
    arabic.setTextSize(23);
    arabic.setTextColor(Color.BLACK);
    arabic.setGravity(Gravity.RIGHT);
    arabic.setTextIsSelectable(true);
    arabic.setPadding(0, 12, 0, 12);
    card.addView(arabic);
    if (!e.translation.isEmpty()) {
      TextView translated = new TextView(this);
      translated.setText(e.translation);
      translated.setTextSize(18);
      translated.setTextColor(Color.BLACK);
      translated.setGravity(Gravity.RIGHT);
      translated.setTextIsSelectable(true);
      translated.setPadding(0, 0, 0, 12);
      card.addView(translated);
    }
    if (!e.reference.isEmpty()) {
      TextView source = new TextView(this);
      source.setText("سەرچاوە: " + e.reference);
      source.setTextSize(13);
      source.setTextColor(Color.DKGRAY);
      card.addView(source);
    }
    final Button play = new Button(this);
    play.setText(e.audio != null ? "▶  گوێگرتن" : "▶  گوێگرتن (دەنگی ئامێر)");
    play.setOnClickListener(v -> {
      if (playingButton == play) { stopAudio(); return; }
      stopAudio();
      playingButton = play;
      playingLabel = play.getText().toString();
      play.setText("■  وەستاندن");
      if (e.audio != null) playEveryAyah(e.audio, 0); else speak(e.arabic);
    });
    card.addView(play);
    final int target = e.target;
    final Button counter = new Button(this);
    counter.setText("ژمارە: 0 / " + target);
    final int[] count = {0};
    counter.setOnClickListener(v -> {
      if (count[0] < target) count[0]++;
      counter.setText("ژمارە: " + count[0] + " / " + target + (count[0] >= target ? "  ✓" : ""));
    });
    counter.setOnLongClickListener(v -> {
      count[0] = 0;
      counter.setText("ژمارە: 0 / " + target);
      return true;
    });
    card.addView(counter);
    return card;
  }

  // ---- audio ----------------------------------------------------------------
  private MediaPlayer player;
  private TextToSpeech tts;
  private boolean ttsReady;
  private Button playingButton;
  private String playingLabel;

  private static final String ALL_LABEL = "▶  هەمووی بخوێنەوە (عەرەبی + کوردی)";
  private boolean allOn;
  private int token;
  private Button allBtn;
  private ScrollView allScroll;
  private ArrayList<View> allViews;
  private Runnable stepDone;
  private boolean kuNoted;

  private void stopAudio() {
    token++;
    allOn = false;
    stepDone = null;
    if (player != null) { try { player.release(); } catch (Exception ignored) { } player = null; }
    if (tts != null) { try { tts.stop(); } catch (Exception ignored) { } }
    if (playingButton != null) { playingButton.setText(playingLabel); playingButton = null; }
    if (allBtn != null) { allBtn.setText(ALL_LABEL); allBtn = null; }
    if (allViews != null) for (View v : allViews) v.setBackgroundColor(Color.WHITE);
  }

  // ---- "play everything": Arabic, then Kurdish, card after card -----------------------
  private void playAll(Button button, final ArrayList<Entry> cards, ArrayList<View> views) {
    stopAudio();
    allOn = true;
    allBtn = button;
    allViews = views;
    button.setText("■  وەستاندن");
    final int my = token;
    if (tts == null) {
      tts = new TextToSpeech(getApplicationContext(), status -> runOnUiThread(() -> {
        if (token == my && allOn) runCard(cards, 0, my);
      }));
    } else {
      runCard(cards, 0, my);
    }
  }

  private void runCard(final ArrayList<Entry> cards, final int index, final int my) {
    if (token != my || !allOn) return;
    if (index >= cards.size()) { stopAudio(); return; }
    final Entry e = cards.get(index);
    for (int i = 0; i < allViews.size(); i++) allViews.get(i).setBackgroundColor(i == index ? Color.parseColor("#FFF6DD") : Color.WHITE);
    if (allScroll != null) allScroll.smoothScrollTo(0, Math.max(0, allViews.get(index).getTop() - 40));
    Runnable kurdish = () -> {
      if (token != my) return;
      String tr = e.translation == null ? "" : e.translation.trim();
      boolean sorani = tr.matches("(?s).*[ەێۆڕڵ].*");
      Locale ku = kurdishLocale();
      if (ku != null && sorani) speakStep(tr, ku, my, () -> runCard(cards, index + 1, my));
      else {
        if (ku == null && !kuNoted) {
          kuNoted = true;
          Toast.makeText(this, "دەنگی کوردی لەسەر ئەم مۆبایلە نییە؛ تەنها عەرەبی دەخوێندرێتەوە", Toast.LENGTH_LONG).show();
        }
        runCard(cards, index + 1, my);
      }
    };
    if (e.audio != null) chain(e.audio, 0, my, kurdish);
    else speakStep(e.arabic.replace("﴿", " ").replace("﴾", " ").replace("*", " "), new Locale("ar"), my, kurdish);
  }

  private Locale kurdishLocale() {
    if (tts == null) return null;
    for (String code : new String[]{"ckb", "ku"}) {
      try {
        Locale l = new Locale(code);
        int r = tts.isLanguageAvailable(l);
        if (r >= TextToSpeech.LANG_AVAILABLE) return l;
      } catch (Exception ignored) { }
    }
    return null;
  }

  private void chain(final String[] files, final int i, final int my, final Runnable done) {
    if (token != my) return;
    if (i >= files.length) { done.run(); return; }
    try {
      if (player != null) player.release();
      player = new MediaPlayer();
      player.setAudioStreamType(AudioManager.STREAM_MUSIC);
      player.setDataSource(files[i]);
      player.setOnPreparedListener(MediaPlayer::start);
      player.setOnCompletionListener(mp -> chain(files, i + 1, my, done));
      player.setOnErrorListener((mp, w, x) -> { chain(files, i + 1, my, done); return true; });
      player.prepareAsync();
    } catch (Exception ex) { chain(files, i + 1, my, done); }
  }

  private void speakStep(String text, Locale locale, final int my, Runnable done) {
    if (token != my) return;
    int r = tts.setLanguage(locale);
    if (r < 0) { done.run(); return; }
    stepDone = done;
    tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
      @Override public void onStart(String id) { }
      @Override public void onError(String id) { finish(id); }
      @Override public void onDone(String id) { finish(id); }
      private void finish(String id) {
        runOnUiThread(() -> {
          if (id != null && id.startsWith("step") && token == my && stepDone != null) {
            Runnable d = stepDone; stepDone = null; d.run();
          } else if ("end".equals(id)) stopAudio();
        });
      }
    });
    int pos = 0, n = 0;
    while (pos < text.length()) {
      int end = Math.min(text.length(), pos + 3000);
      HashMap<String, String> params = new HashMap<>();
      params.put(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, end >= text.length() ? "step" + my : "part" + n);
      tts.speak(text.substring(pos, end), n == 0 ? TextToSpeech.QUEUE_FLUSH : TextToSpeech.QUEUE_ADD, params);
      pos = end; n++;
    }
  }

  private void playEveryAyah(final String[] files, final int index) {
    final Button owner = playingButton;
    if (owner == null) return;
    if (index >= files.length) { stopAudio(); return; }
    try {
      if (player != null) player.release();
      player = new MediaPlayer();
      player.setAudioStreamType(AudioManager.STREAM_MUSIC);
      player.setDataSource(files[index]);
      player.setOnPreparedListener(MediaPlayer::start);
      player.setOnCompletionListener(mp -> { if (playingButton == owner) playEveryAyah(files, index + 1); });
      player.setOnErrorListener((mp, what, extra) -> {
        if (playingButton == owner) {
          stopAudio();
          Toast.makeText(ZikrActivity.this, "ئینتەرنێت بپشکنە بۆ گوێگرتن", Toast.LENGTH_LONG).show();
        }
        return true;
      });
      player.prepareAsync();
    } catch (Exception ex) {
      stopAudio();
      Toast.makeText(this, "نەتوانرا دەنگەکە بکرێتەوە", Toast.LENGTH_LONG).show();
    }
  }

  private void speak(final String arabic) {
    final String text = arabic.replace("﴿", " ").replace("﴾", " ").replace("*", " ");
    if (tts == null) {
      tts = new TextToSpeech(getApplicationContext(), status -> {
        if (status == TextToSpeech.SUCCESS) {
          int r = tts.setLanguage(new Locale("ar"));
          ttsReady = r != TextToSpeech.LANG_MISSING_DATA && r != TextToSpeech.LANG_NOT_SUPPORTED;
        }
        runOnUiThread(() -> speakNow(text));
      });
    } else {
      speakNow(text);
    }
  }

  private void speakNow(String text) {
    if (playingButton == null) return;
    ttsReady = tts.setLanguage(new Locale("ar")) >= 0;
    if (!ttsReady) { stopAudio(); Toast.makeText(this, "دەنگی عەرەبی لەسەر ئەم مۆبایلە دانەمەزراوە", Toast.LENGTH_LONG).show(); return; }
    tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
      @Override public void onStart(String id) { }
      @Override public void onError(String id) { runOnUiThread(ZikrActivity.this::stopAudio); }
      @Override public void onDone(String id) { if ("end".equals(id)) runOnUiThread(ZikrActivity.this::stopAudio); }
    });
    int pos = 0, n = 0;
    while (pos < text.length()) {
      int end = Math.min(text.length(), pos + 3000);
      boolean last = end >= text.length();
      HashMap<String, String> params = new HashMap<>();
      params.put(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, last ? "end" : "p" + n);
      tts.speak(text.substring(pos, end), n == 0 ? TextToSpeech.QUEUE_FLUSH : TextToSpeech.QUEUE_ADD, params);
      pos = end; n++;
    }
  }

  private LinearLayout column() {
    LinearLayout result = new LinearLayout(this);
    result.setOrientation(LinearLayout.VERTICAL);
    result.setPadding(16, 8, 16, 24);
    return result;
  }

  private void addBack(String label, Runnable action) {
    TextView back = new TextView(this);
    back.setText(label);
    back.setTextSize(16);
    back.setTextColor(Color.BLACK);
    back.setGravity(Gravity.CENTER_VERTICAL);
    back.setPadding(20, 18, 20, 18);
    back.setOnClickListener(v -> action.run());
    root.addView(back);
  }

  private void addHeading(String title) {
    TextView heading = new TextView(this);
    heading.setText(title);
    heading.setTextSize(22);
    heading.setTextColor(Color.BLACK);
    heading.setGravity(Gravity.CENTER);
    heading.setPadding(20, 8, 20, 18);
    root.addView(heading);
  }

  private void addRow(LinearLayout parent, String title, String trailing, Runnable click) {
    TextView row = new TextView(this);
    row.setText(title + "   " + trailing);
    row.setTextSize(18);
    row.setTextColor(Color.BLACK);
    row.setGravity(Gravity.CENTER_VERTICAL | Gravity.RIGHT);
    row.setPadding(18, 18, 18, 18);
    row.setBackgroundColor(Color.WHITE);
    row.setOnClickListener(v -> click.run());
    LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(-1, -2);
    p.setMargins(0, 0, 0, 10);
    parent.addView(row, p);
  }

  @Override protected void onPause() {
    stopAudio();
    super.onPause();
  }

  @Override protected void onDestroy() {
    stopAudio();
    if (tts != null) { tts.shutdown(); tts = null; }
    super.onDestroy();
  }
}
