package com.quran.labs.androidquran;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.quran.labs.androidquran.ui.QuranActivity;
import com.quran.labs.androidquran.ui.ZikrActivity;
import com.quran.labs.androidquran.util.QuranSettings;

/** First screen that lets the user choose Quran or personal adhkar. */
public class SectionChooserActivity extends Activity {
  private int dp(float value) {
    return (int) (value * getResources().getDisplayMetrics().density + 0.5f);
  }

  private GradientDrawable rounded(int color, int strokeColor) {
    GradientDrawable shape = new GradientDrawable();
    shape.setColor(color);
    shape.setCornerRadius(dp(20));
    shape.setStroke(dp(1), strokeColor);
    return shape;
  }

  private TextView label(String text, float size, int color, boolean bold) {
    TextView view = new TextView(this);
    view.setText(text);
    view.setTextSize(size);
    view.setTextColor(color);
    view.setGravity(Gravity.CENTER);
    if (bold) view.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
    return view;
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    if (Build.VERSION.SDK_INT >= 21) {
      getWindow().setStatusBarColor(Color.rgb(20, 79, 58));
      getWindow().setNavigationBarColor(Color.rgb(248, 250, 248));
      getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
    }

    LinearLayout page = new LinearLayout(this);
    page.setOrientation(LinearLayout.VERTICAL);
    page.setGravity(Gravity.CENTER_HORIZONTAL);
    page.setPadding(dp(22), dp(24), dp(22), dp(24));
    page.setBackgroundColor(Color.rgb(248, 250, 248));

    TextView emblem = label("۞", 42, Color.WHITE, false);
    emblem.setBackground(rounded(Color.rgb(31, 112, 79), Color.rgb(31, 112, 79)));
    LinearLayout.LayoutParams emblemParams = new LinearLayout.LayoutParams(dp(82), dp(82));
    emblemParams.gravity = Gravity.CENTER_HORIZONTAL;
    emblemParams.bottomMargin = dp(18);
    page.addView(emblem, emblemParams);

    TextView title = label("بەخێربێیت بۆ قورئانی پیرۆز", 23, Color.rgb(24, 75, 55), true);
    page.addView(title, new LinearLayout.LayoutParams(-1, -2));

    TextView subtitle = label("تکایە بەشەکەت هەڵبژێرە", 15, Color.rgb(100, 115, 106), false);
    LinearLayout.LayoutParams subtitleParams = new LinearLayout.LayoutParams(-1, -2);
    subtitleParams.topMargin = dp(10);
    subtitleParams.bottomMargin = dp(30);
    page.addView(subtitle, subtitleParams);

    Button quran = new Button(this);
    quran.setAllCaps(false);
    quran.setText("📖  قورئانی پیرۆز\nخوێندنەوەی قورئان و موسحەف");
    quran.setTextSize(18);
    quran.setTextColor(Color.rgb(27, 76, 55));
    quran.setGravity(Gravity.CENTER);
    quran.setBackground(rounded(Color.rgb(232, 245, 237), Color.rgb(177, 213, 192)));
    quran.setMinHeight(dp(104));
    quran.setOnClickListener(v -> openQuran());
    LinearLayout.LayoutParams choiceParams = new LinearLayout.LayoutParams(-1, dp(112));
    choiceParams.bottomMargin = dp(15);
    page.addView(quran, choiceParams);

    Button zikr = new Button(this);
    zikr.setAllCaps(false);
    zikr.setText("☀  زیکرەکانم\nزیکری بەیانی و ئێوارە و پێش خەوتن");
    zikr.setTextSize(18);
    zikr.setTextColor(Color.rgb(112, 82, 28));
    zikr.setGravity(Gravity.CENTER);
    zikr.setBackground(rounded(Color.rgb(251, 245, 229), Color.rgb(226, 210, 165)));
    zikr.setMinHeight(dp(104));
    zikr.setOnClickListener(v -> startActivity(new Intent(this, ZikrActivity.class)));
    page.addView(zikr, new LinearLayout.LayoutParams(-1, dp(112)));

    TextView note = label("هەردوو بەشەکە لە هەمان ئەپدان", 12, Color.rgb(115, 125, 118), false);
    LinearLayout.LayoutParams noteParams = new LinearLayout.LayoutParams(-1, -2);
    noteParams.topMargin = dp(25);
    page.addView(note, noteParams);

    setContentView(page);
  }

  private void openQuran() {
    Intent intent = new Intent(this, QuranActivity.class);
    intent.putExtra(QuranActivity.EXTRA_SHOW_TRANSLATION_UPGRADE,
        QuranSettings.getInstance(this).haveUpdatedTranslations());
    startActivity(intent);
  }
}
