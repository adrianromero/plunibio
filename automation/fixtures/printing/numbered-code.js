// EditorText print QA: numbered JavaScript
const title = "Line numbering";

/* This comment spans
multiple source lines. */
const values = [10, 20, 30];
function total(items) {
    return items.reduce((sum, value) => sum + value, 0);
}

const description = "This deliberately long source line should wrap on paper while keeping its original line number, without numbering each visual continuation as a separate source line in the printed document.";
console.log(title, total(values), description);
