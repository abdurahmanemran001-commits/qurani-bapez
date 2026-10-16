package com.quran.labs.androidquran.ui;

import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
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

  private void showItems(int chapterId, String chapterTitle, String categoryTitle) {
    root.removeAllViews();
    addBack("‹  " + categoryTitle, () -> showChapters(currentCategory, categoryTitle));
    addHeading(chapterTitle);
    ScrollView scroll = new ScrollView(this);
    LinearLayout list = column();
    String sql = "SELECT item._id, item.item, COALESCE(transl.item_translation,''), " +
        "COALESCE(ref_transl.reference,''), COALESCE(ref_transl.reference,'') " +
        "FROM azkar_item item " +
        "LEFT JOIN azkar_item_translation transl ON transl.item_id=item._id AND transl.language=? " +
        "LEFT JOIN azkar_reference ref ON ref.item_id=item._id " +
        "LEFT JOIN azkar_reference_translation ref_transl ON ref_transl.reference_id=ref._id AND ref_transl.language=? " +
        "WHERE item.chapter_id=? ORDER BY item._id";
    Cursor c = db.rawQuery(sql, new String[]{language(), language(), String.valueOf(chapterId)});
    int number = 0;
    while (c.moveToNext()) {
      number++;
      LinearLayout card = column();
      card.setPadding(18, 18, 18, 18);
      card.setBackgroundColor(Color.WHITE);
      TextView num = new TextView(this);
      num.setText("زیکر " + number);
      num.setTextSize(14);
      num.setTextColor(Color.BLACK);
      card.addView(num);
      TextView arabic = new TextView(this);
      arabic.setText(c.getString(1));
      arabic.setTextSize(23);
      arabic.setTextColor(Color.BLACK);
      arabic.setGravity(Gravity.RIGHT);
      arabic.setTextIsSelectable(true);
      arabic.setPadding(0, 12, 0, 12);
      card.addView(arabic);
      String translation = c.getString(2);
      if (translation != null && !translation.trim().isEmpty()) {
        TextView translated = new TextView(this);
        translated.setText(translation);
        translated.setTextSize(18);
        translated.setTextColor(Color.BLACK);
        translated.setGravity(Gravity.RIGHT);
        translated.setTextIsSelectable(true);
        translated.setPadding(0, 0, 0, 12);
        card.addView(translated);
      }
      String reference = c.getString(3);
      if (reference != null && !reference.trim().isEmpty()) {
        TextView source = new TextView(this);
        source.setText("سەرچاوە: " + reference);
        source.setTextSize(13);
        source.setTextColor(Color.DKGRAY);
        card.addView(source);
      }
      Button counter = new Button(this);
      int target = 1;
      counter.setText("ژمارە: 0 / " + target);
      final int[] count = {0};
      counter.setOnClickListener(v -> {
        if (count[0] < target) count[0]++;
        counter.setText("ژمارە: " + count[0] + " / " + target);
      });
      card.addView(counter);
      LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(-1, -2);
      p.setMargins(0, 0, 0, 16);
      list.addView(card, p);
    }
    c.close();
    scroll.addView(list);
    root.addView(scroll, new LinearLayout.LayoutParams(-1, 0, 1));
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

  @Override protected void onDestroy() {
    if (db != null && db.isOpen()) db.close();
    super.onDestroy();
  }
}
