/* =====================================================
   NEOPOCKET AI — i18n.js
   Language dictionary + translation engine.
   Add a new language by adding one more block below and
   one line in LANGUAGES.
   ===================================================== */
'use strict';

const LANGUAGES = [
  { code: 'en', name: 'English',  flag: '🇬🇧' },
  { code: 'ja', name: '日本語',    flag: '🇯🇵' },
  { code: 'ne', name: 'नेपाली',    flag: '🇳🇵' },
  { code: 'hi', name: 'हिन्दी',    flag: '🇮🇳' },
  { code: 'es', name: 'Español',  flag: '🇪🇸' },
  { code: 'zh', name: '中文',      flag: '🇨🇳' },
];

const TRANSLATIONS = {

/* ── ENGLISH (base / fallback) ── */
en: {
  nav_dashboard:'Dashboard', nav_add:'Add Expense', nav_analytics:'Analytics', nav_ai:'AI Advisor', nav_forecast:'Forecast',
  sidebar_plan:'Pro Member', settings_language:'Language', logout_title:'Logout', logout_confirm:'Log out of NEOPOCKET AI?',

  dash_title:'Dashboard', dash_welcome:'Welcome back, {name} 👋',
  metric_income:'Monthly Income', metric_income_sub:'Base salary',
  metric_spent:'Total Spent', metric_spent_vs:'vs last month',
  metric_savings:'Net Savings', metric_savings_pct:'{pct}% of income saved',
  metric_savings_alltime:'All-time total: {amt}',
  alltime_savings_title:'All-Time Net Savings',
  alltime_savings_hint:'Total income minus total spending since you started using the app.',
  budget_progress:'Budget Progress', financial_health:'Financial Health',
  score_msg_great:'Great job! Keep managing your spending.',
  score_msg_good:'You can improve by reducing discretionary spending.',
  score_msg_bad:'Your expenses are very high this month.',
  recent_tx:'Recent Transactions', empty_tx:'No transactions yet', empty_tx_all:'No transactions yet',
  spent_colon:'Spent: {amt}', budget_colon:'Budget: {amt}', used_suffix:'{pct}% used', remaining_suffix:'{amt} remaining',
  score_excellent:'Excellent', score_good_label:'Good', score_fair:'Fair', score_needs_work:'Needs Work',

  add_title:'Add Expense', add_subtitle:'Track a new expense', expense_details:'Expense Details',
  scan_receipt_title:'📷 Scan a Bill Photo', scan_receipt_hint:'Upload or snap a photo of a receipt/bill — NEOPOCKET AI will read it and pull out each item.',
  choose_photo_btn:'Choose / Take Photo', scan_receipt_btn:'Scan Bill', scanning_btn:'Scanning...',
  no_items_detected:'No items could be read from that photo. Try a clearer photo, or add the expense manually below.',
  add_scanned_btn:'Add Selected to Expenses', toast_select_at_least_one:'Select at least one item',
  toast_bad_image:'Could not read that image file',
  store_name_label:'Store / Shop Name', store_name_ph:'e.g. Bhat Bhateni Supermarket',
  item_name_ph:'Item name', scan_items_hint:'Uncheck any line the AI misread. Items are grouped by category and saved as one expense per category, with the store as the name and the items listed in the note.',
  receipt_fallback_name:'Receipt',
  expense_name:'Expense Name', expense_name_ph:'e.g. Starbucks coffee',
  amount_label:'Amount (¥)', amount_ph:'e.g. 1500', date_label:'Date',
  note_label:'Note (optional)', note_ph:'Any note...', category_label:'Category',
  save_expense_btn:'➕ Save Expense', monthly_income_label:'Monthly Income', update_income_btn:'Update Income',
  income_month_hint:'This only sets income for the month shown above — past and future months keep their own values.',

  toast_enter_name:'Please enter a name', toast_enter_amount:'Please enter a valid amount',
  toast_pick_date:'Please pick a date', toast_select_category:'Please select a category',
  toast_expense_saved:'✅ Expense saved!', toast_income_updated:'✅ Income updated!',
  toast_enter_valid_income:'Enter a valid income', toast_save_failed:'Failed to save data to server',
  toast_fill_fields:'Fill all fields', toast_expense_updated:'✅ Expense updated!', toast_expense_deleted:'🗑️ Expense deleted',
  confirm_delete_expense:'Delete this expense?', edit_expense_title:'Edit Expense', save_changes_btn:'💾 Save Changes',

  analytics_title:'Analytics', analytics_subtitle:'Spending breakdown & trends',
  export_excel_btn:'⬇️ Export Excel', no_export_alert:'No expenses to export yet.',
  category_breakdown:'Category Breakdown', legend_title:'Legend', no_data_month:'No data this month',
  trend_6mo:'6-Month Trend', all_transactions:'All Transactions',

  ai_title:'AI Advisor', ai_subtitle:'Personalized financial advice',
  ai_coach:'NEOPOCKET AI Coach', ai_powered:'Powered by smart spending analysis',
  ai_summary:'This month\'s spending data has been analyzed. Personalized advice was generated from {n} transaction(s).',
  ask_ai:'💬 Ask NEOPOCKET AI',
  ask_ai_hint:'Type an expense (e.g. "Starbucks 850 yen today") to add it automatically, or ask a question about your money. Or just tap a suggestion below.',
  chat_placeholder:'Type here...', send_btn:'Send', sending_btn:'...',
  toast_expense_added:'✅ Added {n} expense(s)', ai_error:'⚠️ Something went wrong.',
  ai_type_alert:'⚠️ Alert', ai_type_warning:'⚡ Warning', ai_type_success:'✅ Great', ai_type_info:'ℹ️ Tip',

  advisor_settings_title:'Advisor Settings', advisor_settings_hint:'Pick the month and currency the AI Advisor should analyze.',
  advisor_month_label:'Month', advisor_currency_label:'Currency',
  budget_limits_title:'Category Budget Limits', budget_limits_hint:'Set a monthly limit per category. The AI Advisor will warn you at 80% and flag a breach at 100%.',
  save_budget_limits_btn:'💾 Save Budget Limits', no_limit_ph:'No limit',
  toast_budget_limits_saved:'✅ Budget limits saved!',
  savings_goals_title:'Savings Goals', savings_goals_hint:'Track a goal — the AI Advisor estimates your runway from this month\'s net savings.',
  goal_name_ph:'Goal name (e.g. New bike)', goal_target_ph:'Target amount',
  add_goal_btn:'➕ Add Goal', no_goals_yet:'No savings goals yet — add one below.',
  toast_goal_added:'✅ Savings goal added!', toast_goal_deleted:'🗑️ Goal deleted',
  recurring_label:'🔁 This is a recurring subscription/bill',

  adv_food_high_title:'Food spending too high',
  adv_food_high_text:'Your Food spending makes up {pct}% of this month\'s total. Ideally it should be under 30%. Cooking more at home could save around ¥{amt} per month.',
  adv_food_watch_title:'Food budget watch',
  adv_food_watch_text:'Food spending is {pct}%. That\'s a bit high — cutting convenience-store trips by 2 times a week could save ¥3,000–5,000 a month.',
  adv_savings_low_title:'Very low savings rate',
  adv_savings_low_text:'This month\'s savings rate is {pct}%. Financial experts recommend at least 20%. Consider reviewing big expenses and trimming subscriptions.',
  adv_savings_below_title:'Savings below target',
  adv_savings_below_text:'Savings rate {pct}% — below the 20% target. Auto-saving ¥{amt}/month would add up to ¥{amt2} a year.',
  adv_savings_great_title:'Great savings rate!',
  adv_savings_great_text:'Excellent! A {pct}% savings rate is great. Keep this pace and you\'ll save ¥{amt} in 6 months.',
  adv_entertain_title:'Entertainment spending high',
  adv_entertain_text:'Entertainment spending is {pct}% ({amt}). Switching subscriptions to annual billing can save up to 20%.',
  adv_shopping_title:'Shopping over budget',
  adv_shopping_text:'Shopping spending is {amt} ({pct}%). Try a 24-hour rule before buying to reduce impulse purchases.',
  adv_bills_title:'Utility cost tip',
  adv_bills_text:'Bills cost {amt} — switching power providers or using energy-saving settings could save ¥1,000–3,000 a month.',
  adv_general_tip_title:'AI Financial tip',
  tip_0:'💡 Aim to keep an emergency fund covering 3–6 months of income.',
  tip_1:'📊 Try managing monthly spending with the 50/20/30 rule: needs 50%, goals 20%, lifestyle 30%.',
  tip_2:'🔄 Reviewing fixed costs (rent, phone plan, insurance) once a year can lead to big savings.',
  tip_3:'📱 Regularly reviewing your spending in a budgeting app is the first step to building wealth.',

  quick_q_0:'How much can I save this month?', quick_q_1:'Save ¥20,000 for a bike — how long?',
  quick_q_2:'Where am I overspending?', quick_q_3:'My daily average spend',

  forecast_title:'Forecast', forecast_subtitle:'Next 3-month balance prediction', est_savings:'est. savings',
  status_on_track:'✅ On track', status_watch:'⚠️ Watch', status_at_risk:'🚨 At risk',
  projected_trend:'Projected Balance Trend', prediction_basis:'Prediction Basis',
  current_month_spent:'Current month spent', monthly_income_label2:'Monthly income',
  growth_assumption:'Growth assumption', growth_value:'+2% per month',
  data_points:'Data points', transactions_word:'transactions',

  cat_food:'Food', cat_transport:'Transport', cat_shopping:'Shopping', cat_health:'Health',
  cat_entertain:'Entertainment', cat_bills:'Bills', cat_other:'Other',

  login_app_name:'NEOPOCKET AI', login_tagline:'Smart Finance Assistant',
  tab_login:'Login', tab_signup:'Sign Up',
  email_label:'Email', email_ph:'Enter your email', password_label:'Password', password_ph:'Enter your password',
  login_btn:'Login', no_account:'No account?', signup_free:'Sign up free',
  full_name_label:'Full Name', full_name_ph:'Enter your full name',
  signup_password_ph:'Create a password (min 6 chars)',
  confirm_password_label:'Confirm Password', confirm_password_ph:'Repeat your password',
  create_account_btn:'Create Account', already_account:'Already have an account?',
  err_both_fields:'Please enter both email and password.', err_all_fields:'All fields are required.',
  err_password_mismatch:'❌ Passwords do not match.', success_account_created:'✅ Account created! Redirecting...',
},

/* ── JAPANESE ── */
ja: {
  nav_dashboard:'ダッシュボード', nav_add:'支出を追加', nav_analytics:'分析', nav_ai:'AIアドバイザー', nav_forecast:'予測',
  sidebar_plan:'プロ会員', settings_language:'言語', logout_title:'ログアウト', logout_confirm:'NEOPOCKET AIからログアウトしますか？',

  dash_title:'ダッシュボード', dash_welcome:'おかえりなさい、{name} さん 👋',
  metric_income:'月収', metric_income_sub:'基本給',
  metric_spent:'支出合計', metric_spent_vs:'先月比',
  metric_savings:'純貯蓄', metric_savings_pct:'収入の{pct}%を貯蓄',
  metric_savings_alltime:'累計合計：{amt}',
  alltime_savings_title:'累計純貯蓄',
  alltime_savings_hint:'アプリを使い始めてからの総収入から総支出を引いた金額です。',
  budget_progress:'予算の進捗', financial_health:'家計の健全度',
  score_msg_great:'素晴らしい！この調子で支出を管理しましょう。',
  score_msg_good:'不要な支出を減らすことでさらに改善できます。',
  score_msg_bad:'今月の支出はかなり多めです。',
  recent_tx:'最近の取引', empty_tx:'まだ取引がありません', empty_tx_all:'まだ取引がありません',
  spent_colon:'支出：{amt}', budget_colon:'予算：{amt}', used_suffix:'{pct}%使用', remaining_suffix:'残り{amt}',
  score_excellent:'優秀', score_good_label:'良好', score_fair:'普通', score_needs_work:'要改善',

  add_title:'支出を追加', add_subtitle:'新しい支出を記録', expense_details:'支出の詳細',
  expense_name:'支出名', expense_name_ph:'例：スターバックスのコーヒー',
  amount_label:'金額（¥）', amount_ph:'例：1500', date_label:'日付',
  note_label:'メモ（任意）', note_ph:'メモを入力...', category_label:'カテゴリー',
  save_expense_btn:'➕ 支出を保存', monthly_income_label:'月収', update_income_btn:'収入を更新',
  income_month_hint:'これは上に表示されている月の収入のみを設定します。過去や未来の月には影響しません。',

  toast_enter_name:'名前を入力してください', toast_enter_amount:'有効な金額を入力してください',
  toast_pick_date:'日付を選択してください', toast_select_category:'カテゴリーを選択してください',
  toast_expense_saved:'✅ 支出を保存しました！', toast_income_updated:'✅ 収入を更新しました！',
  toast_enter_valid_income:'有効な収入を入力してください', toast_save_failed:'サーバーへの保存に失敗しました',
  toast_fill_fields:'すべての項目を入力してください', toast_expense_updated:'✅ 支出を更新しました！', toast_expense_deleted:'🗑️ 支出を削除しました',
  confirm_delete_expense:'この支出を削除しますか？', edit_expense_title:'支出を編集', save_changes_btn:'💾 変更を保存',

  analytics_title:'分析', analytics_subtitle:'支出の内訳とトレンド',
  export_excel_btn:'⬇️ Excelに書き出す', no_export_alert:'書き出せる支出がまだありません。',
  category_breakdown:'カテゴリー別内訳', legend_title:'凡例', no_data_month:'今月のデータはありません',
  trend_6mo:'過去6ヶ月の推移', all_transactions:'すべての取引',

  ai_title:'AIアドバイザー', ai_subtitle:'あなた専用の家計アドバイス',
  ai_coach:'NEOPOCKET AIコーチ', ai_powered:'スマート支出分析による提供',
  ai_summary:'今月の支出データを分析しました。{n}件の取引から、あなたへの最適なアドバイスを生成しました。',
  ask_ai:'💬 NEOPOCKET AIに質問する',
  ask_ai_hint:'「スターバックス 850円 今日」のように入力すると自動で登録されます。お金についての質問もできます。下の候補をタップしてもOKです。',
  chat_placeholder:'ここに入力してください...', send_btn:'送信', sending_btn:'…',
  toast_expense_added:'✅ {n}件の支出を追加しました', ai_error:'⚠️ エラーが発生しました。',
  ai_type_alert:'⚠️ 警告', ai_type_warning:'⚡ 注意', ai_type_success:'✅ 優秀', ai_type_info:'ℹ️ ヒント',

  adv_food_high_title:'食費が高すぎます',
  adv_food_high_text:'あなたの食費は今月の合計の {pct}% を占めています。理想は30%以下です。自炊を増やすことで月 ¥{amt} 節約できる可能性があります。',
  adv_food_watch_title:'食費に注意',
  adv_food_watch_text:'食費が {pct}% です。少し高めですが、コンビニ利用を週2回減らすと月 ¥3,000〜5,000 の節約につながります。',
  adv_savings_low_title:'貯金率がとても低いです',
  adv_savings_low_text:'今月の貯金率は {pct}% です。財務専門家は最低20%を推奨しています。大きな出費を見直し、サブスクを整理することをお勧めします。',
  adv_savings_below_title:'貯金率が目標を下回っています',
  adv_savings_below_text:'貯金率 {pct}% — 目標の20%を下回っています。月 ¥{amt} を自動貯金に設定すると、年間で ¥{amt2} 貯まります。',
  adv_savings_great_title:'貯金率が素晴らしいです！',
  adv_savings_great_text:'素晴らしい！貯金率 {pct}% は優秀です。このペースを維持すると、6ヶ月で ¥{amt} の貯金になります。',
  adv_entertain_title:'娯楽費が高めです',
  adv_entertain_text:'娯楽費が {pct}%（{amt}）です。サブスクリプションを年払いに切り替えると最大20%の割引が受けられます。',
  adv_shopping_title:'買い物が予算オーバーです',
  adv_shopping_text:'買い物の支出が {amt}（{pct}%）です。購入前に24時間待つルールを試すと衝動買いが減ります。',
  adv_bills_title:'光熱費の節約ヒント',
  adv_bills_text:'光熱費 {amt} — 電力会社の切り替えや省エネ設定で月 ¥1,000〜3,000 削減できる可能性があります。',
  adv_general_tip_title:'AIからの家計アドバイス',
  tip_0:'💡 収入の3〜6ヶ月分の緊急資金を確保することを目標にしましょう。',
  tip_1:'📊 毎月の支出を3つの柱「必需品50%・ゴール20%・生活費30%」で管理するのがおすすめです。',
  tip_2:'🔄 固定費（家賃・通信費・保険）は年1回見直すことで大幅な節約になります。',
  tip_3:'📱 家計アプリでの定期的な支出レビューが資産形成の第一歩です。',

  quick_q_0:'今月あといくら貯金できる？', quick_q_1:'自転車用に2万円貯めるにはどのくらい？',
  quick_q_2:'どのカテゴリーで使いすぎている？', quick_q_3:'1日の平均支出は？',

  forecast_title:'予測', forecast_subtitle:'今後3ヶ月の収支予測', est_savings:'予想貯蓄額',
  status_on_track:'✅ 順調', status_watch:'⚠️ 要注意', status_at_risk:'🚨 危険',
  projected_trend:'予測される残高の推移', prediction_basis:'予測の根拠',
  current_month_spent:'今月の支出', monthly_income_label2:'月収',
  growth_assumption:'想定される増加率', growth_value:'月+2%',
  data_points:'データ件数', transactions_word:'件の取引',

  cat_food:'食費', cat_transport:'交通費', cat_shopping:'買い物', cat_health:'健康',
  cat_entertain:'娯楽', cat_bills:'光熱費', cat_other:'その他',

  login_app_name:'NEOPOCKET AI', login_tagline:'スマート家計アシスタント',
  tab_login:'ログイン', tab_signup:'新規登録',
  email_label:'メールアドレス', email_ph:'メールアドレスを入力', password_label:'パスワード', password_ph:'パスワードを入力',
  login_btn:'ログイン', no_account:'アカウントをお持ちでないですか？', signup_free:'無料で登録',
  full_name_label:'氏名', full_name_ph:'氏名を入力',
  signup_password_ph:'パスワードを作成（6文字以上）',
  confirm_password_label:'パスワード確認', confirm_password_ph:'パスワードを再入力',
  create_account_btn:'アカウントを作成', already_account:'すでにアカウントをお持ちですか？',
  err_both_fields:'メールアドレスとパスワードの両方を入力してください。', err_all_fields:'すべての項目を入力してください。',
  err_password_mismatch:'❌ パスワードが一致しません。', success_account_created:'✅ アカウントを作成しました！移動中...',
},

/* ── NEPALI ── */
ne: {
  nav_dashboard:'ड्यासबोर्ड', nav_add:'खर्च थप्नुहोस्', nav_analytics:'विश्लेषण', nav_ai:'AI सल्लाहकार', nav_forecast:'पूर्वानुमान',
  sidebar_plan:'प्रो सदस्य', settings_language:'भाषा', logout_title:'लगआउट', logout_confirm:'NEOPOCKET AI बाट लगआउट गर्ने हो?',

  dash_title:'ड्यासबोर्ड', dash_welcome:'फेरि स्वागत छ, {name} 👋',
  metric_income:'मासिक आम्दानी', metric_income_sub:'आधार तलब',
  metric_spent:'कुल खर्च', metric_spent_vs:'गत महिनाको तुलनामा',
  metric_savings:'खुद बचत', metric_savings_pct:'आम्दानीको {pct}% बचत भयो',
  metric_savings_alltime:'अहिलेसम्मको कुल: {amt}',
  alltime_savings_title:'अहिलेसम्मको कुल खुद बचत',
  alltime_savings_hint:'तपाईंले एप प्रयोग गर्न सुरु गरेदेखि हालसम्मको कुल आम्दानी घटाउ कुल खर्च।',
  budget_progress:'बजेट प्रगति', financial_health:'आर्थिक स्वास्थ्य',
  score_msg_great:'शाबास! यसरी नै खर्च व्यवस्थापन गर्नुहोस्।',
  score_msg_good:'अनावश्यक खर्च घटाएर तपाईं अझ राम्रो गर्न सक्नुहुन्छ।',
  score_msg_bad:'यस महिना तपाईंको खर्च धेरै बढी छ।',
  recent_tx:'हालैका कारोबारहरू', empty_tx:'अहिलेसम्म कुनै कारोबार छैन', empty_tx_all:'अहिलेसम्म कुनै कारोबार छैन',
  spent_colon:'खर्च: {amt}', budget_colon:'बजेट: {amt}', used_suffix:'{pct}% प्रयोग भयो', remaining_suffix:'{amt} बाँकी',
  score_excellent:'उत्कृष्ट', score_good_label:'राम्रो', score_fair:'ठीकै', score_needs_work:'सुधार आवश्यक',

  add_title:'खर्च थप्नुहोस्', add_subtitle:'नयाँ खर्च रेकर्ड गर्नुहोस्', expense_details:'खर्चको विवरण',
  expense_name:'खर्चको नाम', expense_name_ph:'जस्तै: स्टारबक्स कफी',
  amount_label:'रकम (¥)', amount_ph:'जस्तै: 1500', date_label:'मिति',
  note_label:'टिप्पणी (वैकल्पिक)', note_ph:'कुनै टिप्पणी...', category_label:'श्रेणी',
  save_expense_btn:'➕ खर्च सुरक्षित गर्नुहोस्', monthly_income_label:'मासिक आम्दानी', update_income_btn:'आम्दानी अपडेट गर्नुहोस्',
  income_month_hint:'यसले माथि देखाइएको महिनाको मात्र आम्दानी सेट गर्छ — विगत र आगामी महिनाहरूको आम्दानी छुट्टै रहन्छ।',

  toast_enter_name:'कृपया नाम लेख्नुहोस्', toast_enter_amount:'कृपया मान्य रकम लेख्नुहोस्',
  toast_pick_date:'कृपया मिति छान्नुहोस्', toast_select_category:'कृपया श्रेणी छान्नुहोस्',
  toast_expense_saved:'✅ खर्च सुरक्षित भयो!', toast_income_updated:'✅ आम्दानी अपडेट भयो!',
  toast_enter_valid_income:'मान्य आम्दानी लेख्नुहोस्', toast_save_failed:'सर्भरमा डाटा सेभ गर्न असफल भयो',
  toast_fill_fields:'सबै फिल्डहरू भर्नुहोस्', toast_expense_updated:'✅ खर्च अपडेट भयो!', toast_expense_deleted:'🗑️ खर्च मेटाइयो',
  confirm_delete_expense:'यो खर्च मेटाउने हो?', edit_expense_title:'खर्च सम्पादन गर्नुहोस्', save_changes_btn:'💾 परिवर्तनहरू सुरक्षित गर्नुहोस्',

  analytics_title:'विश्लेषण', analytics_subtitle:'खर्चको विवरण र प्रवृत्ति',
  export_excel_btn:'⬇️ Excel मा निर्यात गर्नुहोस्', no_export_alert:'निर्यात गर्न कुनै खर्च छैन।',
  category_breakdown:'श्रेणी अनुसार विवरण', legend_title:'लिजेन्ड', no_data_month:'यस महिना कुनै डाटा छैन',
  trend_6mo:'६ महिनाको प्रवृत्ति', all_transactions:'सबै कारोबारहरू',

  ai_title:'AI सल्लाहकार', ai_subtitle:'व्यक्तिगत आर्थिक सल्लाह',
  ai_coach:'NEOPOCKET AI कोच', ai_powered:'स्मार्ट खर्च विश्लेषणद्वारा सञ्चालित',
  ai_summary:'यस महिनाको खर्च डाटा विश्लेषण गरियो। {n} कारोबारबाट तपाईंको लागि उत्तम सल्लाह तयार गरियो।',
  ask_ai:'💬 NEOPOCKET AI लाई सोध्नुहोस्',
  ask_ai_hint:'खर्च टाइप गर्नुहोस् (जस्तै "स्टारबक्स ८५० येन आज") स्वतः थप्न, वा आफ्नो पैसाको बारेमा प्रश्न सोध्नुहोस्। वा तलको सुझाव ट्याप गर्नुहोस्।',
  chat_placeholder:'यहाँ लेख्नुहोस्...', send_btn:'पठाउनुहोस्', sending_btn:'...',
  toast_expense_added:'✅ {n} वटा खर्च थपियो', ai_error:'⚠️ केही समस्या भयो।',
  ai_type_alert:'⚠️ सतर्कता', ai_type_warning:'⚡ चेतावनी', ai_type_success:'✅ उत्कृष्ट', ai_type_info:'ℹ️ सुझाव',

  adv_food_high_title:'खाना खर्च धेरै बढी',
  adv_food_high_text:'तपाईंको खाना खर्चले यस महिनाको कुलको {pct}% ओगटेको छ। आदर्श रूपमा यो 30% भन्दा कम हुनुपर्छ। बढी घरमा पकाएर महिनाको लगभग ¥{amt} बचत गर्न सकिन्छ।',
  adv_food_watch_title:'खाना बजेटमा ध्यान दिनुहोस्',
  adv_food_watch_text:'खाना खर्च {pct}% छ। यो अलि बढी हो — कन्भिनियन्स स्टोर प्रयोग हप्तामा २ पटक घटाउँदा महिनाको ¥3,000–5,000 बचत हुन सक्छ।',
  adv_savings_low_title:'बचत दर धेरै कम छ',
  adv_savings_low_text:'यस महिनाको बचत दर {pct}% छ। वित्तीय विशेषज्ञहरूले कम्तीमा 20% सिफारिस गर्छन्। ठूला खर्चहरू पुनरावलोकन गरी सदस्यताहरू घटाउने विचार गर्नुहोस्।',
  adv_savings_below_title:'बचत लक्ष्यभन्दा कम',
  adv_savings_below_text:'बचत दर {pct}% — 20% लक्ष्यभन्दा कम। महिनाको ¥{amt} स्वतः बचत सेट गर्दा वर्षमा ¥{amt2} जम्मा हुन्छ।',
  adv_savings_great_title:'उत्कृष्ट बचत दर!',
  adv_savings_great_text:'उत्कृष्ट! {pct}% बचत दर धेरै राम्रो हो। यही गति कायम राख्नुभयो भने ६ महिनामा ¥{amt} बचत हुनेछ।',
  adv_entertain_title:'मनोरञ्जन खर्च धेरै',
  adv_entertain_text:'मनोरञ्जन खर्च {pct}% ({amt}) छ। सदस्यताहरू वार्षिक भुक्तानीमा परिवर्तन गरे 20% सम्म छुट पाउन सकिन्छ।',
  adv_shopping_title:'किनमेल बजेट नाघ्यो',
  adv_shopping_text:'किनमेल खर्च {amt} ({pct}%) छ। किन्नु अघि 24 घण्टा पर्खने नियम अपनाउँदा आवेगमा किनमेल घट्छ।',
  adv_bills_title:'बिजुली/उपयोगिता खर्च सुझाव',
  adv_bills_text:'बिल खर्च {amt} — बिजुली प्रदायक परिवर्तन वा ऊर्जा बचत सेटिङले महिनाको ¥1,000–3,000 बचत गर्न सकिन्छ।',
  adv_general_tip_title:'AI आर्थिक सुझाव',
  tip_0:'💡 आम्दानीको 3–6 महिना बराबरको आपतकालीन कोष जोगाउने लक्ष्य राख्नुहोस्।',
  tip_1:'📊 मासिक खर्चलाई ५०/२०/३० नियमले व्यवस्थापन गर्नुहोस्: आवश्यकता 50%, लक्ष्य 20%, जीवनशैली 30%।',
  tip_2:'🔄 स्थिर खर्च (भाडा, फोन, बीमा) वर्षको एक पटक पुनरावलोकन गर्दा ठूलो बचत हुन्छ।',
  tip_3:'📱 बजेट एपमा नियमित रूपमा खर्च समीक्षा गर्नु सम्पत्ति निर्माणको पहिलो कदम हो।',

  quick_q_0:'यस महिना म कति बचत गर्न सक्छु?', quick_q_1:'साइकलको लागि ¥20,000 बचत गर्न कति समय लाग्छ?',
  quick_q_2:'म कहाँ बढी खर्च गर्दैछु?', quick_q_3:'मेरो दैनिक औसत खर्च कति हो?',

  forecast_title:'पूर्वानुमान', forecast_subtitle:'आगामी ३ महिनाको बचत पूर्वानुमान', est_savings:'अनुमानित बचत',
  status_on_track:'✅ ट्र्याकमा', status_watch:'⚠️ ध्यान दिनुहोस्', status_at_risk:'🚨 जोखिममा',
  projected_trend:'अनुमानित बचत प्रवृत्ति', prediction_basis:'पूर्वानुमानको आधार',
  current_month_spent:'यस महिनाको खर्च', monthly_income_label2:'मासिक आम्दानी',
  growth_assumption:'वृद्धि अनुमान', growth_value:'महिनाको +2%',
  data_points:'डाटा बिन्दुहरू', transactions_word:'कारोबारहरू',

  cat_food:'खाना', cat_transport:'यातायात', cat_shopping:'किनमेल', cat_health:'स्वास्थ्य',
  cat_entertain:'मनोरञ्जन', cat_bills:'बिल', cat_other:'अन्य',

  login_app_name:'NEOPOCKET AI', login_tagline:'स्मार्ट फाइनान्स सहायक',
  tab_login:'लगइन', tab_signup:'साइन अप',
  email_label:'इमेल', email_ph:'आफ्नो इमेल लेख्नुहोस्', password_label:'पासवर्ड', password_ph:'आफ्नो पासवर्ड लेख्नुहोस्',
  login_btn:'लगइन', no_account:'खाता छैन?', signup_free:'निःशुल्क साइन अप गर्नुहोस्',
  full_name_label:'पुरा नाम', full_name_ph:'आफ्नो पुरा नाम लेख्नुहोस्',
  signup_password_ph:'पासवर्ड बनाउनुहोस् (कम्तीमा 6 अक्षर)',
  confirm_password_label:'पासवर्ड पुष्टि गर्नुहोस्', confirm_password_ph:'पासवर्ड फेरि लेख्नुहोस्',
  create_account_btn:'खाता बनाउनुहोस्', already_account:'पहिले नै खाता छ?',
  err_both_fields:'कृपया इमेल र पासवर्ड दुवै लेख्नुहोस्।', err_all_fields:'सबै फिल्डहरू आवश्यक छन्।',
  err_password_mismatch:'❌ पासवर्ड मेल खाएन।', success_account_created:'✅ खाता बनियो! रिडाइरेक्ट हुँदैछ...',
},

/* ── HINDI ── */
hi: {
  nav_dashboard:'डैशबोर्ड', nav_add:'खर्च जोड़ें', nav_analytics:'विश्लेषण', nav_ai:'AI सलाहकार', nav_forecast:'पूर्वानुमान',
  sidebar_plan:'प्रो सदस्य', settings_language:'भाषा', logout_title:'लॉगआउट', logout_confirm:'NEOPOCKET AI से लॉगआउट करें?',

  dash_title:'डैशबोर्ड', dash_welcome:'वापसी पर स्वागत है, {name} 👋',
  metric_income:'मासिक आय', metric_income_sub:'मूल वेतन',
  metric_spent:'कुल खर्च', metric_spent_vs:'पिछले महीने की तुलना में',
  metric_savings:'शुद्ध बचत', metric_savings_pct:'आय का {pct}% बचाया गया',
  metric_savings_alltime:'अब तक का कुल: {amt}',
  alltime_savings_title:'अब तक की कुल शुद्ध बचत',
  alltime_savings_hint:'आपके ऐप इस्तेमाल शुरू करने के बाद से कुल आय घटा कुल खर्च।',
  budget_progress:'बजट प्रगति', financial_health:'वित्तीय स्वास्थ्य',
  score_msg_great:'शानदार! अपने खर्च को इसी तरह प्रबंधित करते रहें।',
  score_msg_good:'गैर-ज़रूरी खर्च घटाकर आप और बेहतर कर सकते हैं।',
  score_msg_bad:'इस महीने आपका खर्च काफी अधिक है।',
  recent_tx:'हाल के लेन-देन', empty_tx:'अभी तक कोई लेन-देन नहीं', empty_tx_all:'अभी तक कोई लेन-देन नहीं',
  spent_colon:'खर्च: {amt}', budget_colon:'बजट: {amt}', used_suffix:'{pct}% उपयोग हुआ', remaining_suffix:'{amt} शेष',
  score_excellent:'उत्कृष्ट', score_good_label:'अच्छा', score_fair:'ठीक', score_needs_work:'सुधार आवश्यक',

  add_title:'खर्च जोड़ें', add_subtitle:'नया खर्च दर्ज करें', expense_details:'खर्च का विवरण',
  expense_name:'खर्च का नाम', expense_name_ph:'जैसे: स्टारबक्स कॉफ़ी',
  amount_label:'राशि (¥)', amount_ph:'जैसे: 1500', date_label:'तारीख',
  note_label:'टिप्पणी (वैकल्पिक)', note_ph:'कोई टिप्पणी...', category_label:'श्रेणी',
  save_expense_btn:'➕ खर्च सहेजें', monthly_income_label:'मासिक आय', update_income_btn:'आय अपडेट करें',
  income_month_hint:'यह केवल ऊपर दिखाए गए महीने की आय सेट करता है — पिछले और आगामी महीनों की आय अलग-अलग बनी रहती है।',

  toast_enter_name:'कृपया नाम दर्ज करें', toast_enter_amount:'कृपया मान्य राशि दर्ज करें',
  toast_pick_date:'कृपया तारीख चुनें', toast_select_category:'कृपया श्रेणी चुनें',
  toast_expense_saved:'✅ खर्च सहेजा गया!', toast_income_updated:'✅ आय अपडेट हुई!',
  toast_enter_valid_income:'मान्य आय दर्ज करें', toast_save_failed:'सर्वर पर डेटा सहेजना विफल',
  toast_fill_fields:'सभी फ़ील्ड भरें', toast_expense_updated:'✅ खर्च अपडेट हुआ!', toast_expense_deleted:'🗑️ खर्च हटाया गया',
  confirm_delete_expense:'यह खर्च हटाएं?', edit_expense_title:'खर्च संपादित करें', save_changes_btn:'💾 परिवर्तन सहेजें',

  analytics_title:'विश्लेषण', analytics_subtitle:'खर्च का विवरण और रुझान',
  export_excel_btn:'⬇️ Excel में निर्यात करें', no_export_alert:'अभी निर्यात करने के लिए कोई खर्च नहीं है।',
  category_breakdown:'श्रेणीवार विवरण', legend_title:'लीजेंड', no_data_month:'इस महीने कोई डेटा नहीं',
  trend_6mo:'6-माह का रुझान', all_transactions:'सभी लेन-देन',

  ai_title:'AI सलाहकार', ai_subtitle:'व्यक्तिगत वित्तीय सलाह',
  ai_coach:'NEOPOCKET AI कोच', ai_powered:'स्मार्ट खर्च विश्लेषण द्वारा संचालित',
  ai_summary:'इस महीने के खर्च डेटा का विश्लेषण किया गया। {n} लेन-देन से आपके लिए सर्वोत्तम सलाह तैयार की गई।',
  ask_ai:'💬 NEOPOCKET AI से पूछें',
  ask_ai_hint:'खर्च टाइप करें (जैसे "स्टारबक्स 850 येन आज") स्वतः जोड़ने के लिए, या पैसे के बारे में सवाल पूछें। या नीचे दिए सुझाव पर टैप करें।',
  chat_placeholder:'यहाँ टाइप करें...', send_btn:'भेजें', sending_btn:'...',
  toast_expense_added:'✅ {n} खर्च जोड़े गए', ai_error:'⚠️ कुछ गड़बड़ हो गई।',
  ai_type_alert:'⚠️ चेतावनी', ai_type_warning:'⚡ सावधानी', ai_type_success:'✅ बढ़िया', ai_type_info:'ℹ️ सुझाव',

  adv_food_high_title:'भोजन खर्च बहुत अधिक',
  adv_food_high_text:'आपका भोजन खर्च इस महीने के कुल का {pct}% है। आदर्श रूप से यह 30% से कम होना चाहिए। घर पर अधिक खाना बनाकर लगभग ¥{amt} प्रति माह बचाया जा सकता है।',
  adv_food_watch_title:'भोजन बजट पर ध्यान दें',
  adv_food_watch_text:'भोजन खर्च {pct}% है। यह थोड़ा अधिक है — सप्ताह में 2 बार कन्वीनियंस स्टोर का उपयोग घटाने से महीने में ¥3,000–5,000 बच सकते हैं।',
  adv_savings_low_title:'बचत दर बहुत कम',
  adv_savings_low_text:'इस महीने की बचत दर {pct}% है। वित्तीय विशेषज्ञ कम से कम 20% की सलाह देते हैं। बड़े खर्चों की समीक्षा करें और सदस्यताएं घटाएं।',
  adv_savings_below_title:'बचत लक्ष्य से कम',
  adv_savings_below_text:'बचत दर {pct}% — 20% लक्ष्य से कम। ¥{amt}/माह की ऑटो-सेविंग से साल में ¥{amt2} जमा हो सकते हैं।',
  adv_savings_great_title:'शानदार बचत दर!',
  adv_savings_great_text:'बहुत बढ़िया! {pct}% बचत दर उत्कृष्ट है। यह गति बनाए रखने पर 6 महीनों में ¥{amt} की बचत होगी।',
  adv_entertain_title:'मनोरंजन खर्च अधिक',
  adv_entertain_text:'मनोरंजन खर्च {pct}% ({amt}) है। सदस्यताओं को वार्षिक भुगतान में बदलने पर 20% तक छूट मिल सकती है।',
  adv_shopping_title:'खरीदारी बजट से अधिक',
  adv_shopping_text:'खरीदारी खर्च {amt} ({pct}%) है। खरीदने से पहले 24 घंटे रुकने का नियम आवेग में खरीदारी घटा सकता है।',
  adv_bills_title:'बिजली/उपयोगिता खर्च सुझाव',
  adv_bills_text:'बिल खर्च {amt} — बिजली प्रदाता बदलने या ऊर्जा-बचत सेटिंग से महीने में ¥1,000–3,000 बच सकते हैं।',
  adv_general_tip_title:'AI वित्तीय सुझाव',
  tip_0:'💡 आय के 3–6 महीनों के बराबर आपातकालीन फंड रखने का लक्ष्य रखें।',
  tip_1:'📊 मासिक खर्च को 50/20/30 नियम से प्रबंधित करें: ज़रूरतें 50%, लक्ष्य 20%, जीवनशैली 30%।',
  tip_2:'🔄 स्थिर खर्चों (किराया, फ़ोन, बीमा) की साल में एक बार समीक्षा से बड़ी बचत हो सकती है।',
  tip_3:'📱 बजट ऐप में नियमित खर्च समीक्षा धन निर्माण का पहला कदम है।',

  quick_q_0:'इस महीने मैं कितना बचा सकता हूँ?', quick_q_1:'साइकिल के लिए ¥20,000 बचाने में कितना समय लगेगा?',
  quick_q_2:'मैं कहाँ अधिक खर्च कर रहा हूँ?', quick_q_3:'मेरा औसत दैनिक खर्च कितना है?',

  forecast_title:'पूर्वानुमान', forecast_subtitle:'अगले 3 महीनों का बचत पूर्वानुमान', est_savings:'अनुमानित बचत',
  status_on_track:'✅ ट्रैक पर', status_watch:'⚠️ ध्यान दें', status_at_risk:'🚨 जोखिम में',
  projected_trend:'अनुमानित बचत रुझान', prediction_basis:'पूर्वानुमान आधार',
  current_month_spent:'इस महीने का खर्च', monthly_income_label2:'मासिक आय',
  growth_assumption:'वृद्धि अनुमान', growth_value:'+2% प्रति माह',
  data_points:'डेटा बिंदु', transactions_word:'लेन-देन',

  cat_food:'भोजन', cat_transport:'यातायात', cat_shopping:'खरीदारी', cat_health:'स्वास्थ्य',
  cat_entertain:'मनोरंजन', cat_bills:'बिल', cat_other:'अन्य',

  login_app_name:'NEOPOCKET AI', login_tagline:'स्मार्ट फाइनेंस सहायक',
  tab_login:'लॉगिन', tab_signup:'साइन अप',
  email_label:'ईमेल', email_ph:'अपना ईमेल दर्ज करें', password_label:'पासवर्ड', password_ph:'अपना पासवर्ड दर्ज करें',
  login_btn:'लॉगिन', no_account:'खाता नहीं है?', signup_free:'मुफ्त साइन अप करें',
  full_name_label:'पूरा नाम', full_name_ph:'अपना पूरा नाम दर्ज करें',
  signup_password_ph:'पासवर्ड बनाएं (कम से कम 6 अक्षर)',
  confirm_password_label:'पासवर्ड की पुष्टि करें', confirm_password_ph:'पासवर्ड फिर से दर्ज करें',
  create_account_btn:'खाता बनाएं', already_account:'पहले से खाता है?',
  err_both_fields:'कृपया ईमेल और पासवर्ड दोनों दर्ज करें।', err_all_fields:'सभी फ़ील्ड आवश्यक हैं।',
  err_password_mismatch:'❌ पासवर्ड मेल नहीं खाते।', success_account_created:'✅ खाता बन गया! रीडायरेक्ट हो रहा है...',
},

/* ── SPANISH ── */
es: {
  nav_dashboard:'Panel', nav_add:'Añadir gasto', nav_analytics:'Analítica', nav_ai:'Asesor IA', nav_forecast:'Pronóstico',
  sidebar_plan:'Miembro Pro', settings_language:'Idioma', logout_title:'Cerrar sesión', logout_confirm:'¿Cerrar sesión de NEOPOCKET AI?',

  dash_title:'Panel', dash_welcome:'Bienvenido de nuevo, {name} 👋',
  metric_income:'Ingreso mensual', metric_income_sub:'Salario base',
  metric_spent:'Gasto total', metric_spent_vs:'vs. mes pasado',
  metric_savings:'Ahorro neto', metric_savings_pct:'{pct}% del ingreso ahorrado',
  metric_savings_alltime:'Total histórico: {amt}',
  alltime_savings_title:'Ahorro Neto Histórico',
  alltime_savings_hint:'Ingreso total menos gasto total desde que empezaste a usar la app.',
  budget_progress:'Progreso del presupuesto', financial_health:'Salud financiera',
  score_msg_great:'¡Buen trabajo! Sigue gestionando tus gastos así.',
  score_msg_good:'Puedes mejorar reduciendo los gastos discrecionales.',
  score_msg_bad:'Tus gastos son muy altos este mes.',
  recent_tx:'Transacciones recientes', empty_tx:'Aún no hay transacciones', empty_tx_all:'Aún no hay transacciones',
  spent_colon:'Gastado: {amt}', budget_colon:'Presupuesto: {amt}', used_suffix:'{pct}% usado', remaining_suffix:'{amt} restante',
  score_excellent:'Excelente', score_good_label:'Bueno', score_fair:'Regular', score_needs_work:'Necesita mejorar',

  add_title:'Añadir gasto', add_subtitle:'Registra un nuevo gasto', expense_details:'Detalles del gasto',
  expense_name:'Nombre del gasto', expense_name_ph:'ej. Café Starbucks',
  amount_label:'Monto (¥)', amount_ph:'ej. 1500', date_label:'Fecha',
  note_label:'Nota (opcional)', note_ph:'Alguna nota...', category_label:'Categoría',
  save_expense_btn:'➕ Guardar gasto', monthly_income_label:'Ingreso mensual', update_income_btn:'Actualizar ingreso',
  income_month_hint:'Esto solo establece el ingreso del mes mostrado arriba — los meses pasados y futuros mantienen sus propios valores.',

  toast_enter_name:'Por favor ingresa un nombre', toast_enter_amount:'Por favor ingresa un monto válido',
  toast_pick_date:'Por favor elige una fecha', toast_select_category:'Por favor selecciona una categoría',
  toast_expense_saved:'✅ ¡Gasto guardado!', toast_income_updated:'✅ ¡Ingreso actualizado!',
  toast_enter_valid_income:'Ingresa un ingreso válido', toast_save_failed:'Error al guardar los datos en el servidor',
  toast_fill_fields:'Completa todos los campos', toast_expense_updated:'✅ ¡Gasto actualizado!', toast_expense_deleted:'🗑️ Gasto eliminado',
  confirm_delete_expense:'¿Eliminar este gasto?', edit_expense_title:'Editar gasto', save_changes_btn:'💾 Guardar cambios',

  analytics_title:'Analítica', analytics_subtitle:'Desglose de gastos y tendencias',
  export_excel_btn:'⬇️ Exportar a Excel', no_export_alert:'Aún no hay gastos para exportar.',
  category_breakdown:'Desglose por categoría', legend_title:'Leyenda', no_data_month:'Sin datos este mes',
  trend_6mo:'Tendencia de 6 meses', all_transactions:'Todas las transacciones',

  ai_title:'Asesor IA', ai_subtitle:'Asesoría financiera personalizada',
  ai_coach:'Entrenador NEOPOCKET AI', ai_powered:'Impulsado por análisis inteligente de gastos',
  ai_summary:'Se analizaron los datos de gasto de este mes. Se generó asesoría personalizada a partir de {n} transacción(es).',
  ask_ai:'💬 Pregúntale a NEOPOCKET AI',
  ask_ai_hint:'Escribe un gasto (ej. "Starbucks 850 yenes hoy") para añadirlo automáticamente, o haz una pregunta sobre tu dinero. O toca una sugerencia abajo.',
  chat_placeholder:'Escribe aquí...', send_btn:'Enviar', sending_btn:'...',
  toast_expense_added:'✅ Se añadieron {n} gasto(s)', ai_error:'⚠️ Algo salió mal.',
  ai_type_alert:'⚠️ Alerta', ai_type_warning:'⚡ Advertencia', ai_type_success:'✅ Genial', ai_type_info:'ℹ️ Consejo',

  adv_food_high_title:'Gasto en comida muy alto',
  adv_food_high_text:'Tu gasto en Comida representa el {pct}% del total de este mes. Lo ideal es menos del 30%. Cocinar más en casa podría ahorrar unos ¥{amt} al mes.',
  adv_food_watch_title:'Vigila el presupuesto de comida',
  adv_food_watch_text:'El gasto en comida es {pct}%. Es un poco alto — reducir las visitas a tiendas de conveniencia 2 veces por semana podría ahorrar ¥3,000–5,000 al mes.',
  adv_savings_low_title:'Tasa de ahorro muy baja',
  adv_savings_low_text:'La tasa de ahorro de este mes es {pct}%. Los expertos financieros recomiendan al menos 20%. Considera revisar gastos grandes y recortar suscripciones.',
  adv_savings_below_title:'Ahorro por debajo del objetivo',
  adv_savings_below_text:'Tasa de ahorro {pct}% — por debajo del objetivo del 20%. Ahorrar automáticamente ¥{amt}/mes sumaría ¥{amt2} al año.',
  adv_savings_great_title:'¡Excelente tasa de ahorro!',
  adv_savings_great_text:'¡Excelente! Una tasa de ahorro del {pct}% es genial. Mantén este ritmo y ahorrarás ¥{amt} en 6 meses.',
  adv_entertain_title:'Gasto en entretenimiento alto',
  adv_entertain_text:'El gasto en Entretenimiento es {pct}% ({amt}). Cambiar suscripciones a facturación anual puede ahorrar hasta 20%.',
  adv_shopping_title:'Compras por encima del presupuesto',
  adv_shopping_text:'El gasto en Compras es {amt} ({pct}%). Prueba la regla de esperar 24 horas antes de comprar para reducir compras impulsivas.',
  adv_bills_title:'Consejo sobre servicios',
  adv_bills_text:'Gasto en Facturas {amt} — cambiar de proveedor eléctrico o usar ajustes de ahorro de energía podría ahorrar ¥1,000–3,000 al mes.',
  adv_general_tip_title:'Consejo financiero de la IA',
  tip_0:'💡 Intenta mantener un fondo de emergencia de 3 a 6 meses de ingresos.',
  tip_1:'📊 Gestiona el gasto mensual con la regla 50/20/30: necesidades 50%, metas 20%, estilo de vida 30%.',
  tip_2:'🔄 Revisar los gastos fijos (alquiler, plan telefónico, seguro) una vez al año puede generar grandes ahorros.',
  tip_3:'📱 Revisar tus gastos regularmente en una app de presupuesto es el primer paso para construir patrimonio.',

  quick_q_0:'¿Cuánto puedo ahorrar este mes?', quick_q_1:'Ahorrar ¥20,000 para una bici — ¿cuánto tardaré?',
  quick_q_2:'¿Dónde estoy gastando de más?', quick_q_3:'Mi gasto diario promedio',

  forecast_title:'Pronóstico', forecast_subtitle:'Predicción de saldo de los próximos 3 meses', est_savings:'ahorro estimado',
  status_on_track:'✅ En buen camino', status_watch:'⚠️ Vigilar', status_at_risk:'🚨 En riesgo',
  projected_trend:'Tendencia de saldo proyectada', prediction_basis:'Base de la predicción',
  current_month_spent:'Gastado este mes', monthly_income_label2:'Ingreso mensual',
  growth_assumption:'Supuesto de crecimiento', growth_value:'+2% al mes',
  data_points:'Puntos de datos', transactions_word:'transacciones',

  cat_food:'Comida', cat_transport:'Transporte', cat_shopping:'Compras', cat_health:'Salud',
  cat_entertain:'Entretenimiento', cat_bills:'Facturas', cat_other:'Otro',

  login_app_name:'NEOPOCKET AI', login_tagline:'Asistente financiero inteligente',
  tab_login:'Iniciar sesión', tab_signup:'Registrarse',
  email_label:'Correo electrónico', email_ph:'Ingresa tu correo', password_label:'Contraseña', password_ph:'Ingresa tu contraseña',
  login_btn:'Iniciar sesión', no_account:'¿No tienes cuenta?', signup_free:'Regístrate gratis',
  full_name_label:'Nombre completo', full_name_ph:'Ingresa tu nombre completo',
  signup_password_ph:'Crea una contraseña (mín. 6 caracteres)',
  confirm_password_label:'Confirmar contraseña', confirm_password_ph:'Repite tu contraseña',
  create_account_btn:'Crear cuenta', already_account:'¿Ya tienes cuenta?',
  err_both_fields:'Por favor ingresa correo y contraseña.', err_all_fields:'Todos los campos son obligatorios.',
  err_password_mismatch:'❌ Las contraseñas no coinciden.', success_account_created:'✅ ¡Cuenta creada! Redirigiendo...',
},

/* ── CHINESE (SIMPLIFIED) ── */
zh: {
  nav_dashboard:'仪表盘', nav_add:'添加支出', nav_analytics:'分析', nav_ai:'AI 顾问', nav_forecast:'预测',
  sidebar_plan:'专业会员', settings_language:'语言', logout_title:'退出登录', logout_confirm:'确定要退出 NEOPOCKET AI 吗？',

  dash_title:'仪表盘', dash_welcome:'欢迎回来，{name} 👋',
  metric_income:'月收入', metric_income_sub:'基本工资',
  metric_spent:'总支出', metric_spent_vs:'与上月相比',
  metric_savings:'净储蓄', metric_savings_pct:'已储蓄收入的 {pct}%',
  metric_savings_alltime:'累计总额：{amt}',
  alltime_savings_title:'累计净储蓄',
  alltime_savings_hint:'自您开始使用本应用以来的总收入减去总支出。',
  budget_progress:'预算进度', financial_health:'财务健康度',
  score_msg_great:'做得好！继续保持良好的消费习惯。',
  score_msg_good:'减少非必要支出可以让你做得更好。',
  score_msg_bad:'本月你的支出非常高。',
  recent_tx:'最近交易', empty_tx:'暂无交易记录', empty_tx_all:'暂无交易记录',
  spent_colon:'已花费：{amt}', budget_colon:'预算：{amt}', used_suffix:'已用 {pct}%', remaining_suffix:'剩余 {amt}',
  score_excellent:'优秀', score_good_label:'良好', score_fair:'一般', score_needs_work:'需要改进',

  add_title:'添加支出', add_subtitle:'记录一笔新支出', expense_details:'支出详情',
  expense_name:'支出名称', expense_name_ph:'例如：星巴克咖啡',
  amount_label:'金额 (¥)', amount_ph:'例如：1500', date_label:'日期',
  note_label:'备注（可选）', note_ph:'添加备注...', category_label:'类别',
  save_expense_btn:'➕ 保存支出', monthly_income_label:'月收入', update_income_btn:'更新收入',
  income_month_hint:'此设置仅适用于上方显示的月份 — 过去和未来的月份将保留各自的收入数值。',

  toast_enter_name:'请输入名称', toast_enter_amount:'请输入有效金额',
  toast_pick_date:'请选择日期', toast_select_category:'请选择类别',
  toast_expense_saved:'✅ 支出已保存！', toast_income_updated:'✅ 收入已更新！',
  toast_enter_valid_income:'请输入有效收入', toast_save_failed:'保存到服务器失败',
  toast_fill_fields:'请填写所有字段', toast_expense_updated:'✅ 支出已更新！', toast_expense_deleted:'🗑️ 支出已删除',
  confirm_delete_expense:'删除此支出？', edit_expense_title:'编辑支出', save_changes_btn:'💾 保存更改',

  analytics_title:'分析', analytics_subtitle:'支出细分与趋势',
  export_excel_btn:'⬇️ 导出 Excel', no_export_alert:'暂无可导出的支出。',
  category_breakdown:'类别细分', legend_title:'图例', no_data_month:'本月暂无数据',
  trend_6mo:'6 个月趋势', all_transactions:'所有交易',

  ai_title:'AI 顾问', ai_subtitle:'个性化财务建议',
  ai_coach:'NEOPOCKET AI 教练', ai_powered:'由智能消费分析驱动',
  ai_summary:'已分析本月支出数据，根据 {n} 笔交易为你生成了最佳建议。',
  ask_ai:'💬 向 NEOPOCKET AI 提问',
  ask_ai_hint:'输入一笔支出（例如"星巴克 850日元 今天"）即可自动添加，或询问关于你的资金的问题。也可以点击下方的建议。',
  chat_placeholder:'在此输入...', send_btn:'发送', sending_btn:'…',
  toast_expense_added:'✅ 已添加 {n} 笔支出', ai_error:'⚠️ 出了点问题。',
  ai_type_alert:'⚠️ 警示', ai_type_warning:'⚡ 注意', ai_type_success:'✅ 很棒', ai_type_info:'ℹ️ 提示',

  adv_food_high_title:'餐饮支出过高',
  adv_food_high_text:'你的餐饮支出占本月总支出的 {pct}%。理想比例应低于 30%。多在家做饭每月可节省约 ¥{amt}。',
  adv_food_watch_title:'请留意餐饮预算',
  adv_food_watch_text:'餐饮支出为 {pct}%，略高。每周减少 2 次便利店消费，每月可节省 ¥3,000–5,000。',
  adv_savings_low_title:'储蓄率非常低',
  adv_savings_low_text:'本月储蓄率为 {pct}%。财务专家建议至少保持 20%。建议审查大额支出并精简订阅服务。',
  adv_savings_below_title:'储蓄未达目标',
  adv_savings_below_text:'储蓄率 {pct}% — 低于 20% 的目标。每月自动储蓄 ¥{amt}，一年可积累 ¥{amt2}。',
  adv_savings_great_title:'储蓄率非常出色！',
  adv_savings_great_text:'太棒了！{pct}% 的储蓄率非常优秀。保持这个节奏，6 个月内可储蓄 ¥{amt}。',
  adv_entertain_title:'娱乐支出偏高',
  adv_entertain_text:'娱乐支出为 {pct}%（{amt}）。将订阅改为按年付费最多可节省 20%。',
  adv_shopping_title:'购物超出预算',
  adv_shopping_text:'购物支出为 {amt}（{pct}%）。购买前尝试等待 24 小时的规则可以减少冲动消费。',
  adv_bills_title:'水电费节省建议',
  adv_bills_text:'账单支出 {amt} — 更换电力供应商或使用节能设置，每月可节省 ¥1,000–3,000。',
  adv_general_tip_title:'AI 理财提示',
  tip_0:'💡 建议目标是储备相当于 3–6 个月收入的应急资金。',
  tip_1:'📊 建议用 50/20/30 法则管理月度支出：必需品 50%、目标 20%、生活方式 30%。',
  tip_2:'🔄 每年审查一次固定支出（房租、话费、保险）可以带来可观的节省。',
  tip_3:'📱 在预算应用中定期审查支出是积累财富的第一步。',

  quick_q_0:'这个月我能存多少钱？', quick_q_1:'为买自行车存 ¥20,000 需要多久？',
  quick_q_2:'我在哪方面超支了？', quick_q_3:'我的日均支出是多少？',

  forecast_title:'预测', forecast_subtitle:'未来 3 个月余额预测', est_savings:'预计储蓄',
  status_on_track:'✅ 进展顺利', status_watch:'⚠️ 需关注', status_at_risk:'🚨 存在风险',
  projected_trend:'预计余额趋势', prediction_basis:'预测依据',
  current_month_spent:'本月支出', monthly_income_label2:'月收入',
  growth_assumption:'增长假设', growth_value:'每月 +2%',
  data_points:'数据点', transactions_word:'笔交易',

  cat_food:'餐饮', cat_transport:'交通', cat_shopping:'购物', cat_health:'健康',
  cat_entertain:'娱乐', cat_bills:'账单', cat_other:'其他',

  login_app_name:'NEOPOCKET AI', login_tagline:'智能理财助手',
  tab_login:'登录', tab_signup:'注册',
  email_label:'邮箱', email_ph:'输入你的邮箱', password_label:'密码', password_ph:'输入你的密码',
  login_btn:'登录', no_account:'还没有账号？', signup_free:'免费注册',
  full_name_label:'全名', full_name_ph:'输入你的全名',
  signup_password_ph:'创建密码（至少 6 位）',
  confirm_password_label:'确认密码', confirm_password_ph:'再次输入密码',
  create_account_btn:'创建账号', already_account:'已有账号？',
  err_both_fields:'请输入邮箱和密码。', err_all_fields:'所有字段均为必填项。',
  err_password_mismatch:'❌ 两次输入的密码不一致。', success_account_created:'✅ 账号已创建！正在跳转...',
},

};

/* ── ENGINE ── */
let currentLang = localStorage.getItem('neopocket_lang') || 'en';
if (!TRANSLATIONS[currentLang]) currentLang = 'en';

function t(key, vars) {
  let str = (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key])
         || (TRANSLATIONS.en && TRANSLATIONS.en[key])
         || key;
  if (vars) {
    Object.keys(vars).forEach(k => {
      str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
    });
  }
  return str;
}

function catLabel(id) {
  return t('cat_' + id) || id;
}

function applyStaticTranslations() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.dataset.i18nTitle);
  });
  syncLanguageSwitcherUI();
}

function syncLanguageSwitcherUI() {
  document.querySelectorAll('.lang-switcher').forEach(sel => {
    sel.value = currentLang;
  });
}

function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) return;
  currentLang = lang;
  localStorage.setItem('neopocket_lang', lang);
  applyStaticTranslations();
  if (typeof updateSidebarUser === 'function') updateSidebarUser();
  if (typeof navigateTo === 'function' && typeof currentPage !== 'undefined') {
    navigateTo(currentPage);
  }
}

function languageSwitcherHTML(extraClass) {
  const opts = LANGUAGES.map(l =>
    `<option value="${l.code}">${l.flag} ${l.name}</option>`
  ).join('');
  return `
    <select class="lang-switcher ${extraClass || ''}" onchange="setLanguage(this.value)" title="Language / 言語 / भाषा">
      ${opts}
    </select>
  `;
}

function mountLanguageSwitchers() {
  ['lang-switcher-slot', 'login-lang-slot'].forEach(id => {
    const slot = document.getElementById(id);
    if (slot && !slot.dataset.mounted) {
      slot.innerHTML = languageSwitcherHTML();
      slot.dataset.mounted = '1';
    }
  });
  syncLanguageSwitcherUI();
}

document.addEventListener('DOMContentLoaded', () => {
  mountLanguageSwitchers();
  applyStaticTranslations();
});
