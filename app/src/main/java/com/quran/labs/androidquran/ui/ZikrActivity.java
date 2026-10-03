package com.quran.labs.androidquran.ui;

import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v7.app.ActionBar;
import android.support.v7.app.AppCompatActivity;
import android.view.Gravity;
import android.view.MenuItem;
import android.view.View;
import android.widget.ArrayAdapter;
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

import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class ZikrActivity extends AppCompatActivity {
  private static final String INDEX_URL = "https://www.hisnmuslim.com/api/ar/husn_ar.json";
  private static final String PREFS = "zikr_cache";
  private static final String INDEX_CACHE = "index";

  private LinearLayout root;
  private ListView categoryList;
  private ProgressBar progress;
  private final ArrayList<Category> categories = new ArrayList<>();

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_zikr);
    root = findViewById(R.id.zikr_root);
    categoryList = findViewById(R.id.zikr_categories);
    progress = findViewById(R.id.zikr_progress);

    ActionBar bar = getSupportActionBar();
    if (bar != null) {
      bar.setTitle(R.string.zikr_title);
      bar.setDisplayHomeAsUpEnabled(true);
    }
    loadIndex();
  }

  @Override
  public boolean onOptionsItemSelected(MenuItem item) {
    if (item.getItemId() == android.R.id.home) {
      finish();
      return true;
    }
    return super.onOptionsItemSelected(item);
  }

  private void loadIndex() {
    String cached = getSharedPreferences(PREFS, MODE_PRIVATE)
        .getString(INDEX_CACHE, null);
    if (cached != null) {
      try {
        parseIndex(cached);
        return;
      } catch (Exception ignored) { }
    }
    setLoading(true);
    new JsonTask(INDEX_URL, true, null).execute();
  }

  private void parseIndex(String json) throws Exception {
    categories.clear();
    JSONObject object = new JSONObject(json.replace("\uFEFF", ""));
    JSONArray array = object.getJSONArray(object.keys().next());

    for (int i = 0; i < array.length(); i++) {
      JSONObject item = array.getJSONObject(i);
      categories.add(new Category(
          item.optInt("ID"),
          item.optString("TITLE"),
          item.optString("TEXT")));
    }

    ArrayList<String> titles = new ArrayList<>();
    for (Category c : categories) titles.add(c.title);

    categoryList.setAdapter(new ArrayAdapter<>(
        this, android.R.layout.simple_list_item_1, titles));
    categoryList.setOnItemClickListener((p, v, position, id) ->
        loadCategory(categories.get(position)));
    categoryList.setVisibility(View.VISIBLE);
    progress.setVisibility(View.GONE);
  }

  private void loadCategory(Category category) {
    String key = "category_" + category.id;
    String cached = getSharedPreferences(PREFS, MODE_PRIVATE).getString(key, null);
    if (cached != null) {
      try {
        showCategory(category.title, cached);
        return;
      } catch (Exception ignored) { }
    }
    setLoading(true);
    new JsonTask(category.url, false, category).execute();
  }

  private void showCategory(String title, String json) throws Exception {
    root.removeAllViews();

    TextView back = new TextView(this);
    back.setText("‹  " + getString(R.string.zikr_all_sections));
    back.setTextSize(16);
    back.setGravity(Gravity.CENTER_VERTICAL);
    back.setPadding(20, 18, 20, 18);
    back.setOnClickListener(v -> restoreCategories());
    root.addView(back);

    TextView heading = new TextView(this);
    heading.setText(title);
    heading.setTextSize(23);
    heading.setGravity(Gravity.CENTER);
    heading.setPadding(20, 12, 20, 20);
    root.addView(heading);

    TextView source = new TextView(this);
    source.setText(R.string.zikr_source_note);
    source.setTextSize(13);
    source.setGravity(Gravity.CENTER);
    source.setPadding(20, 0, 20, 18);
    root.addView(source);

    ScrollView scroll = new ScrollView(this);
    LinearLayout list = new LinearLayout(this);
    list.setOrientation(LinearLayout.VERTICAL);
    list.setPadding(16, 0, 16, 24);

    JSONObject object = new JSONObject(json);
    Iterator<String> keys = object.keys();
    if (!keys.hasNext()) throw new IllegalStateException("Empty section");
    JSONArray items = object.getJSONArray(keys.next());

    for (int i = 0; i < items.length(); i++) {
      JSONObject item = items.getJSONObject(i);
      addZikrCard(list, i + 1,
          item.optString("ARABIC_TEXT"),
          Math.max(1, item.optInt("REPEAT", 1)));
    }

    scroll.addView(list);
    root.addView(scroll, new LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.MATCH_PARENT, 0, 1));
  }

  private void addZikrCard(LinearLayout parent, int number,
                           String text, int target) {
    LinearLayout card = new LinearLayout(this);
    card.setOrientation(LinearLayout.VERTICAL);
    card.setPadding(18, 18, 18, 18);
    card.setBackgroundResource(android.R.drawable.dialog_holo_light_frame);

    TextView numberView = new TextView(this);
    numberView.setText(getString(R.string.zikr_number, number));
    numberView.setTextSize(14);
    card.addView(numberView);

    TextView zikr = new TextView(this);
    zikr.setText(text);
    zikr.setTextSize(20);
    zikr.setGravity(Gravity.RIGHT);
    zikr.setTextIsSelectable(true);
    zikr.setPadding(0, 14, 0, 14);
    card.addView(zikr);

    Button counter = new Button(this);
    counter.setText(getString(R.string.zikr_count, 0, target));
    final int[] count = {0};
    counter.setOnClickListener(v -> {
      if (count[0] < target) count[0]++;
      counter.setText(getString(R.string.zikr_count, count[0], target));
    });
    card.addView(counter);

    LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.MATCH_PARENT,
        LinearLayout.LayoutParams.WRAP_CONTENT);
    params.setMargins(0, 0, 0, 18);
    parent.addView(card, params);
  }

  private void restoreCategories() {
    root.removeAllViews();
    root.addView(categoryList, new LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.MATCH_PARENT, 0, 1));
    categoryList.setVisibility(View.VISIBLE);
    progress.setVisibility(View.GONE);
  }

  private void setLoading(boolean loading) {
    progress.setVisibility(loading ? View.VISIBLE : View.GONE);
    categoryList.setVisibility(loading ? View.GONE : View.VISIBLE);
  }

  private class JsonTask extends AsyncTask<Void, Void, String> {
    private final String url;
    private final boolean index;
    private final Category category;

    JsonTask(String url, boolean index, Category category) {
      this.url = url;
      this.index = index;
      this.category = category;
    }

    @Override
    protected String doInBackground(Void... ignored) {
      try {
        OkHttpClient client = new OkHttpClient();
        Request request = new Request.Builder().url(url).build();
        Response response = client.newCall(request).execute();
        if (!response.isSuccessful() || response.body() == null) {
          throw new IOException("HTTP " + response.code());
        }
        return response.body().string();
      } catch (Exception e) {
        return null;
      }
    }

    @Override
    protected void onPostExecute(String json) {
      setLoading(false);
      if (json == null) {
        Toast.makeText(ZikrActivity.this, R.string.zikr_load_error,
            Toast.LENGTH_LONG).show();
        return;
      }

      try {
        if (index) {
          getSharedPreferences(PREFS, MODE_PRIVATE).edit()
              .putString(INDEX_CACHE, json).apply();
          parseIndex(json);
        } else {
          getSharedPreferences(PREFS, MODE_PRIVATE).edit()
              .putString("category_" + category.id, json).apply();
          showCategory(category.title, json);
        }
      } catch (Exception e) {
        Toast.makeText(ZikrActivity.this, R.string.zikr_load_error,
            Toast.LENGTH_LONG).show();
      }
    }
  }

  private static class Category {
    final int id;
    final String title;
    final String url;

    Category(int id, String title, String url) {
      this.id = id;
      this.title = title;
      this.url = url;
    }
  }
}
