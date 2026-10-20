package com.quran.labs.androidquran.ui;

import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.graphics.Color;
import android.os.AsyncTask;
import android.os.Bundle;
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

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Locale;

public class ZikrActivity extends AppCompatActivity {
  private static final String DB_ASSET = "database/muslim_db_v2.5.1.db";
  private static final String[] LANGUAGES = {"ckb", "ckb_BADINI"};
  private static final String[] LANGUAGE_LABELS = {"کوردیی سۆرانی", "کوردیی بادینی"};

  private LinearLayout root;
  private ListView categoryList;
  private ProgressBar progress;
  private SQLiteDatabase db;
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
    new OpenDatabaseTask().execute();
  }

  @Override public boolean onOptionsItemSelected(MenuItem item) {
    if (item.getItemId() == android.R.id.home) { finish(); return true; }
    return super.onOptionsItemSelected(item);
  }

  private File getBundledDatabase() throws Exception {
    File target = new File(getFilesDir(), "muslim_db_v2.5.1.db");
    if (target.exists() && target.length() > 1000000) return target;
    File temp = new File(getFilesDir(), "muslim_db_v2.5.1.db.tmp");
    try (InputStream in = getAssets().open(DB_ASSET);
         FileOutputStream out = new FileOutputStream(temp)) {
      byte[] buffer = new byte[32768];
      int count;
      while ((count = in.read(buffer)) != -1) out.write(buffer, 0, count);
      out.getFD().sync();
    }
    if (!temp.renameTo(target)) {
      if (target.exists()) target.delete();
      if (!temp.renameTo(target)) throw new Exception("Could not prepare offline azkar database");
    }
    return target;
  }

  private class OpenDatabaseTask extends AsyncTask<Void, Void, Boolean> {
    private String error;
    @Override protected Boolean doInBackground(Void... unused) {
      try {
        File file = getBundledDatabase();
        db = SQLiteDatabase.openDatabase(file.getAbsolutePath(), null, SQLiteDatabase.OPEN_READONLY);
        // Validate the tables needed by the integrated My Prayers dataset.
        Cursor c = db.rawQuery("SELECT language FROM azkar_category_translation LIMIT 1", null);
        c.close();
        return true;
      } catch (Exception e) { error = e.getMessage(); return false; }
    }
    @Override protected void onPostExecute(Boolean ok) {
      progress.setVisibility(View.GONE);
      if (ok) showCategories();
      else Toast.makeText(ZikrActivity.this,
          "زیکرەکان نەکرا بکرێنەوە: " + (error == null ? "" : error),
          Toast.LENGTH_LONG).show();
    }
  }

  private String language() { return LANGUAGES[languageIndex]; }

  private void showCategories() {
    currentCategory = -1;
    root.removeAllViews();
    addLanguageSwitch();
    ScrollView scroll = new ScrollView(this);
    LinearLayout list = column();
    Cursor c = db.rawQuery(
        "SELECT category._id, transl.category_name FROM azkar_category category " +
        "JOIN azkar_category_translation transl ON transl.category_id=category._id " +
        "WHERE transl.language=? ORDER BY category._id", new String[]{language()});
    while (c.moveToNext()) {
      final int id = c.getInt(0);
      addRow(list, c.getString(1), "›", () -> showChapters(id, cSafeTitle(id)));
    }
    c.close();
    scroll.addView(list);
    root.addView(scroll, new LinearLayout.LayoutParams(-1, 0, 1));
  }

  private String cSafeTitle(int id) {
    Cursor c = db.rawQuery("SELECT category_name FROM azkar_category_translation WHERE category_id=? AND language=? LIMIT 1",
        new String[]{String.valueOf(id), language()});
    String title = c.moveToFirst() ? c.getString(0) : "زیکرەکان";
    c.close();
    return title;
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

  private void showChapters(int categoryId, String title) {
    stopAudio();
    currentCategory = categoryId;
    root.removeAllViews();
    addBack("‹  هەموو بەشەکان", this::showCategories);
    addHeading(title);
    ScrollView scroll = new ScrollView(this);
    LinearLayout list = column();
    Cursor c = db.rawQuery(
        "SELECT chapter._id, transl.chapter_name FROM azkar_chapter chapter " +
        "JOIN azkar_chapter_translation transl ON transl.chapter_id=chapter._id " +
        "WHERE chapter.category_id=? AND transl.language=? ORDER BY chapter._id",
        new String[]{String.valueOf(categoryId), language()});
    while (c.moveToNext()) {
      final int chapterId = c.getInt(0);
      final String chapterTitle = c.getString(1);
      addRow(list, chapterTitle, "›", () -> showItems(chapterId, chapterTitle, title));
    }
    c.close();
    scroll.addView(list);
    root.addView(scroll, new LinearLayout.LayoutParams(-1, 0, 1));
  }

  // ---- entries -------------------------------------------------------------
  private static class Entry {
    long id; String title; String arabic; String translation; String reference;
    int target = 1;
    String[] audio; // everyayah file names ("SSSAAA"), null -> device speech
  }

  private static final String AUDIO_BASE = "https://everyayah.com/data/Alafasy_128kbps/";
  private static final String BISMILLAH = "بسم الله الرَّحْمَنِ الرَّحِيمِ";
  private static final String T_KURSI = "ئایەتولکورسی";
  private static final String T_IKHLAS = "سوڕەتی ئیخلاس";
  private static final String T_FALAQ = "سوڕەتی فەلەق";
  private static final String T_NAS = "سوڕەتی ناس";

  private static String[] range(int sura, int from, int to, boolean bism) {
    ArrayList<String> out = new ArrayList<>();
    if (bism) out.add("001001");
    for (int a = from; a <= to; a++) out.add(String.format(Locale.US, "%03d%03d", sura, a));
    return out.toArray(new String[0]);
  }

  private static String[] join(String[]... parts) {
    ArrayList<String> out = new ArrayList<>();
    for (String[] p : parts) for (String x : p) out.add(x);
    return out.toArray(new String[0]);
  }

  private static int parseCount(long id, String arabic) {
    if (id == 126) return 100; // 33 + 33 + 34
    if (arabic.contains("مائة مرة")) return 100;
    if (arabic.contains("عشر مرات")) return 10;
    if (arabic.contains("سبع مرات")) return 7;
    if (arabic.contains("أربع مرات")) return 4;
    if (arabic.contains("ثلاث مرات") || arabic.contains("ثلاثاً")) return 3;
    return 1;
  }

  private static String[] splitOn(String text, String sep) {
    ArrayList<String> out = new ArrayList<>();
    int i = 0;
    while (true) {
      int j = text.indexOf(sep, i);
      if (j < 0) { out.add(text.substring(i)); break; }
      out.add(text.substring(i, j));
      i = j + sep.length();
    }
    return out.toArray(new String[0]);
  }

  private Entry copy(Entry e, String title, String ar, String tr, int target, String[] audio) {
    Entry n = new Entry();
    n.id = e.id; n.title = title; n.arabic = ar.trim(); n.translation = tr.trim();
    n.reference = e.reference; n.target = target; n.audio = audio;
    return n;
  }

  /** Splits the three-surah items into separate cards and attaches recitation audio. */
  private void expand(Entry e, ArrayList<Entry> out) {
    long id = e.id;
    if (id == 75 || id == 98 || id == 120) {
      out.add(copy(e, T_KURSI, e.arabic, e.translation, 1, range(2, 255, 255, false)));
      return;
    }
    if (id == 76 || id == 99 || id == 119) {
      String[] ar = splitOn(e.arabic, BISMILLAH);
      String sepT = "بەناوی خودای بەخشندە و میهرەبان";
      String[] tr = splitOn(e.translation, sepT);
      if (tr.length != 4) { tr = splitOn(e.translation, BISMILLAH); sepT = BISMILLAH; }
      if (tr.length != 4) { // unknown layout: keep the whole translation on the first card
        tr = new String[]{"", e.translation, "", ""};
        sepT = "";
      }
      if (ar.length == 4) {
        boolean sleep = id == 119;
        String intro = ar[0].trim(), introTr = tr[0].trim();
        String last = ar[3];
        int k = last.indexOf('﴾');
        String tail = "", tailTr = "";
        if (k >= 0 && k + 1 < last.length()) { tail = last.substring(k + 1); last = last.substring(0, k + 1); }
        String lastTr = tr[3];
        if (sleep) {
          int t2 = lastTr.indexOf("\nپاشان");
          if (t2 >= 0) { tailTr = lastTr.substring(t2); lastTr = lastTr.substring(0, t2); }
        } else {
          int t = lastTr.lastIndexOf("(سێ جار)");
          if (t >= 0) lastTr = lastTr.substring(0, t);
        }
        int n = sleep ? 3 : 3;
        String a1 = (sleep && !intro.isEmpty() ? intro + "\n" : "") + BISMILLAH + ar[1];
        String t1 = (sleep && !introTr.isEmpty() ? introTr + "\n" : "") + (tr[1].isEmpty() ? "" : sepT) + tr[1];
        out.add(copy(e, T_IKHLAS, a1, t1, n, range(112, 1, 4, true)));
        out.add(copy(e, T_FALAQ, BISMILLAH + ar[2], (tr[2].isEmpty() ? "" : sepT) + tr[2], n, range(113, 1, 5, true)));
        out.add(copy(e, T_NAS, BISMILLAH + last + (sleep ? "\n" + tail : ""),
            (lastTr.isEmpty() ? "" : sepT) + lastTr + (sleep ? tailTr : ""), n, range(114, 1, 6, true)));
        return;
      }
    }
    if (id == 121) e.audio = range(2, 285, 286, false);
    else if (id == 130) e.audio = join(range(32, 1, 30, true), range(67, 1, 30, true));
    e.target = parseCount(id, e.arabic);
    out.add(e);
  }

  private void showItems(int chapterId, String chapterTitle, String categoryTitle) {
    stopAudio();
    root.removeAllViews();
    addBack("‹  " + categoryTitle, () -> showChapters(currentCategory, categoryTitle));
    addHeading(chapterTitle);
    ScrollView scroll = new ScrollView(this);
    LinearLayout list = column();
    String sql = "SELECT item._id, item.item, COALESCE(transl.item_translation,''), " +
        "COALESCE(ref_transl.reference,'') " +
        "FROM azkar_item item " +
        "LEFT JOIN azkar_item_translation transl ON transl.item_id=item._id AND transl.language=? " +
        "LEFT JOIN azkar_reference ref ON ref.item_id=item._id " +
        "LEFT JOIN azkar_reference_translation ref_transl ON ref_transl.reference_id=ref._id AND ref_transl.language=? " +
        "WHERE item.chapter_id=? ORDER BY item._id";
    Cursor c = db.rawQuery(sql, new String[]{language(), language(), String.valueOf(chapterId)});
    ArrayList<Entry> entries = new ArrayList<>();
    long lastId = -1;
    while (c.moveToNext()) {
      long id = c.getLong(0);
      String ref = c.getString(3);
      if (id == lastId) { // several references for one item: join instead of repeating the card
        Entry prev = entries.get(entries.size() - 1);
        if (ref != null && !ref.trim().isEmpty() && !prev.reference.contains(ref)) prev.reference += "\n" + ref;
        continue;
      }
      lastId = id;
      Entry e = new Entry();
      e.id = id; e.arabic = c.getString(1); e.translation = c.getString(2);
      e.reference = ref == null ? "" : ref;
      entries.add(e);
    }
    c.close();
    ArrayList<Entry> cards = new ArrayList<>();
    for (Entry e : entries) expand(e, cards);
    final ArrayList<View> views = new ArrayList<>();
    final Button all = new Button(this);
    all.setText(ALL_LABEL);
    all.setOnClickListener(v -> {
      if (allOn) { stopAudio(); return; }
      playAll(all, cards, views);
    });
    final String video = videoFor(chapterId);
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
    final String longUrl = longAudioFor(chapterId);
    if (longUrl != null) {
      final Button longBtn = new Button(this);
      final String label = "🎧  گوێگرتن بە دەنگی " + longNameFor(chapterId);
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
      credit.setText("دەنگ: " + longNameFor(chapterId) + " (بە مۆڵەتی خۆی)");
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

  /** Official YouTube videos (opened in YouTube, nothing is copied). Chapter id -> video id. */
  private static String videoFor(int chapterId) {
    switch (chapterId) {
      case 27: return "tSIDOt0bg74"; // morning azkar
      default: return null;          // 28 evening, 29 sleep: add when links are available
    }
  }

  /** Full recordings used with the reciter's permission. Chapter id -> mp3 url. */
  private static String longAudioFor(int chapterId) {
    if (chapterId == 27) return "https://github.com/abdurahmanemran001-commits/qurani-bapez/releases/download/zikr-audio/morning.mp3";
    if (chapterId == 28) return "https://github.com/abdurahmanemran001-commits/qurani-bapez/releases/download/zikr-audio/evening.mp3";
    return null;
  }

  private static String longNameFor(int chapterId) {
    return chapterId == 28 ? "هەڵۆ ئەمین" : "بێشەوا قادر ئەلکوردی";
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
    num.setText(e.title != null ? e.title : "زیکر " + number);
    num.setTextSize(e.title != null ? 17 : 14);
    num.setTextColor(e.title != null ? Color.parseColor("#1B5E20") : Color.BLACK);
    card.addView(num);
    TextView arabic = new TextView(this);
    arabic.setText(e.arabic);
    arabic.setTextSize(23);
    arabic.setTextColor(Color.BLACK);
    arabic.setGravity(Gravity.RIGHT);
    arabic.setTextIsSelectable(true);
    arabic.setPadding(0, 12, 0, 12);
    card.addView(arabic);
    if (e.translation != null && !e.translation.trim().isEmpty()) {
      TextView translated = new TextView(this);
      translated.setText(e.translation);
      translated.setTextSize(18);
      translated.setTextColor(Color.BLACK);
      translated.setGravity(Gravity.RIGHT);
      translated.setTextIsSelectable(true);
      translated.setPadding(0, 0, 0, 12);
      card.addView(translated);
    }
    if (e.reference != null && !e.reference.trim().isEmpty()) {
      TextView source = new TextView(this);
      source.setText("سەرچاوە: " + e.reference.trim());
      source.setTextSize(13);
      source.setTextColor(Color.DKGRAY);
      card.addView(source);
    }
    final Button play = new Button(this);
    play.setText(e.audio != null ? "▶  گوێگرتن (قورئان)" : "▶  گوێگرتن (دەنگی ئامێر)");
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
      player.setDataSource(AUDIO_BASE + files[i] + ".mp3");
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
      player.setDataSource(AUDIO_BASE + files[index] + ".mp3");
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
    if (db != null && db.isOpen()) db.close();
    super.onDestroy();
  }
}
