// יצירות: כתבות A4 מהגרף, לפי תקן היצירות. הרכיב המשותף <app-creations> מציג, מדפיס ומעלה לחדר ב-TAARUCHA.
// הנתונים: public/creations.json, נגזר מהגרף ב-scripts/creations.ts.
export default function Creations() {
  return (
    <div className="page creations-page">
      <app-creations src="./creations.json" heading="מה תרבות וגילוי יוצרת" />
    </div>
  );
}
