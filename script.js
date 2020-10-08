/*
Misparaim isolation calculator (https://www.misparaim.org)
Isolation Flows:
    1. symptomatic, aware since when
    2. symptomatic, unaware since when
    3. asymptomatic
*/
window.scissors = {
    settings: {
        ISOLATION_PERIOD: 14,
        SYMPTOMATIC_AWARE_PERIOD: 4,
        SYMPTOMATIC_UNAWARE_PERIOD: 10,
        ASYMPTOMATIC_PERIOD: 7,
        DATE_HUMAN_FMT: 'dddd LL',
        DATEPICKER_FMT: "yyyy-MM-dd",
    },
    last_contact_min_date: false,
    last_page_height: 0,
};

FLATPICKR_LOCALE_HE = {
    weekdays: {
        shorthand: ["א", "ב", "ג", "ד", "ה", "ו", "ש"],
        longhand: ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"],
    },
    months: {
        shorthand: [
            "ינו׳",
            "פבר׳",
            "מרץ",
            "אפר׳",
            "מאי",
            "יוני",
            "יולי",
            "אוג׳",
            "ספט׳",
            "אוק׳",
            "נוב׳",
            "דצמ׳",
        ],
        longhand: [
            "ינואר",
            "פברואר",
            "מרץ",
            "אפריל",
            "מאי",
            "יוני",
            "יולי",
            "אוגוסט",
            "ספטמבר",
            "אוקטובר",
            "נובמבר",
            "דצמבר",
        ],
    },
    rangeSeparator: " אל ",
    time_24hr: true,
};

window.moment.updateLocale('he');


function getHeight() {
    var body = document.body;
    var html = document.documentElement;

    return Math.max(body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight, html.offsetHeight);
}

Formio.icons = 'fontawesome';
Formio.createForm(document.getElementById('formio'), {
    components: [

        {
            "label": "לחולה יש תסמינים?",
            "optionsLabelPosition": "right",
            "inline": false,
            "tableView": false,
            "values": [{
                    "label": "כן",
                    "value": "yes",
                    "shortcut": ""
                },
                {
                    "label": "לא",
                    "value": "no",
                    "shortcut": ""
                }
            ],
            "key": "symptomatic",
            "type": "radio",
            "input": true
        },

        {
            "label": "מתי התחילו התסמינים?",
            "allowInput": false,
            "format": scissors.settings.DATEPICKER_FMT,
            "placeholder": "יש ללחוץ כאן לבחירת תאריך",
            "tableView": false,
            "datePicker": {
                "disableFunction": "moment(date).isAfter(moment())",
                "disableWeekends": false,
                "disableWeekdays": false
            },
            "enableTime": false,
            "key": "symptoms_start_date",
            "customConditional": "show = data.symptomatic === 'yes'",
            "type": "datetime",
            "input": true,
            customOptions: {
                locale: FLATPICKR_LOCALE_HE
            },
            "widget": {
                "type": "calendar",
                "displayInTimezone": "viewer",
                "allowInput": false,
                "mode": "single",
                "enableTime": false,
                "noCalendar": false,
                "format": scissors.settings.DATEPICKER_FMT,
                "hourIncrement": 1,
                "minuteIncrement": 1,
                "time_24hr": false,
                "minDate": null,
                "disableWeekends": false,
                "disableWeekdays": false,
            }
        },
        {
            "label": "לא זכור לנו מתי התחילו התסמינים", // when true, Leads to flow 2
            "tableView": false,
            "key": "unaware_symptoms_start",
            "type": "checkbox",
            "input": true,
            "customConditional": "show = !data.symptoms_start_date && data.symptomatic === 'yes'",
        },
        {
            "label": "מתי התקבלה לחולה תשובה חיובית?",
            "format": scissors.settings.DATEPICKER_FMT,
            "placeholder": "יש ללחוץ כאן לבחירת תאריך",
            "tableView": false,
            "allowInput": false,
            "customConditional": "show = data.symptomatic === 'no' || data.unaware_symptoms_start === true",
            "datePicker": {
                "disableFunction": "moment(date).isAfter(moment())",
                "disableWeekends": false,
                "disableWeekdays": false
            },
            "enableTime": false,
            "key": "diagnosis_date",
            "type": "datetime",
            "input": true,
            customOptions: {
                locale: FLATPICKR_LOCALE_HE
            },
            "widget": {
                "type": "calendar",
                "displayInTimezone": "viewer",
                "allowInput": false,
                "mode": "single",
                "enableTime": false,
                "noCalendar": false,
                "format": scissors.settings.DATEPICKER_FMT,
                "hourIncrement": 1,
                "minuteIncrement": 1,
                "time_24hr": false,
                "minDate": null,
                "disableWeekends": false,
                "disableWeekdays": false,
            }
        },
        {
            "label": "מתי נפגשת עם החולה בפעם האחרונה?",
            "description": 'אם הפגישה האחרונה קרתה בתאריך שלא ניתן לבחור בלוח השנה, יש לסמן "לא נפגשנו בטווח הזמן הזה"',
            "format": scissors.settings.DATEPICKER_FMT,
            "allowInput": false,
            "placeholder": "יש ללחוץ כאן לבחירת תאריך",
            "tableView": false,
            "datePicker": {
                "disableFunction": "moment(date).isAfter(moment()) || moment(date).isBefore(scissors.last_contact_min_date)",
                "disableWeekends": false,
                "disableWeekdays": false
            },
            "enableTime": false,
            "key": "last_contact",
            "customConditional": "show = (data.symptoms_start_date || (data.diagnosis_date && (data.unaware_symptoms_start === true || data.symptomatic === 'no')))",
            "type": "datetime",
            "input": true,
            "redrawOn": "data",
            customOptions: {
                locale: FLATPICKR_LOCALE_HE
            },
            "widget": {
                "type": "calendar",
                "displayInTimezone": "viewer",
                "allowInput": false,
                "mode": "single",
                "enableTime": false,
                "noCalendar": false,
                "format": scissors.settings.DATEPICKER_FMT,
                "hourIncrement": 1,
                "minuteIncrement": 1,
                "time_24hr": false,
                "minDate": null,
                "disableWeekends": false,
                "disableWeekdays": false,
            }

        },
        {
            "label": "לא נפגשנו בטווח הזמן הזה",
            "tableView": false,
            "key": "no_contact",
            "type": "checkbox",
            "input": true,
            "customConditional": "show = !data.last_contact && (data.symptoms_start_date || (data.diagnosis_date && (data.unaware_symptoms_start === true || data.symptomatic === 'no')))",
        },
        /* Result */
        {
            "label": "תוצאה",
            "customClass": "quiz-result-field alert alert-warning",
            "spellcheck": false,
            "disabled": true,
            "hideLabel": true,
            "tableView": true,
            "redrawOn": "data",
            "key": "isolate",
            "customConditional": "show = !!data.isolate",
            "type": "textarea",
            "input": true,
            "clearOnHide": false,
            "calculateValue": function (params) {
                var data = params.data
                if (data.last_contact && !data.no_contact) {
                    var isolation_ending = window.moment(data.last_contact).startOf('d').add(scissors.settings.ISOLATION_PERIOD, 'd');
                    if (isolation_ending.isAfter(moment().startOf('d'))) {
                        var isolation_duration = window.moment.duration(isolation_ending.diff(window.moment().startOf('d')));
                        return 'יש להיכנס לבידוד עד יום ' + isolation_ending.format(scissors.settings.DATE_HUMAN_FMT) + ' (' + isolation_duration.humanize() + ' מהיום)';
                    } else {
                        // shouldn't be false if minimum dates work correctly, but just in case
                        return undefined
                    }
                }
                return false;
            }
        },

        {
            "html": '<p class="alert alert-success font-weight-bold">אין צורך בבידוד</p>',
            "label": "תוצאה",
            "refreshOnChange": false,
            "key": "dont_isloate",
            "customConditional": "show = data.no_contact || data.isolate === undefined",
            "type": "content",
            "input": false,
            "tableView": false
        },
    ]
}).then(function (form) {
    // Prevent submission and alerts
    form.nosubmit = true;
    form.options.noAlerts = true;

    scissors.last_page_height = getHeight()

    form.on('change', function (changed, changes) {
        var data = changed.data
        var min_date_for_isolation = moment().startOf('d').subtract(scissors.settings.ISOLATION_PERIOD - 1, 'd')

        // Set minimum date for last contact datepicker
        if (!!data.symptoms_start_date) {
            scissors.last_contact_min_date = moment.max(min_date_for_isolation, moment(data.symptoms_start_date).startOf('d').subtract(scissors.settings.SYMPTOMATIC_AWARE_PERIOD, 'd'))
        } else if (data.unaware_symptoms_start === true) {
            scissors.last_contact_min_date = moment.max(min_date_for_isolation, moment(data.diagnosis_date).startOf('d').subtract(scissors.settings.SYMPTOMATIC_UNAWARE_PERIOD, 'd'))
        } else if (data.symptomatic === 'no') {
            scissors.last_contact_min_date = moment.max(min_date_for_isolation, moment(data.diagnosis_date).startOf('d').subtract(scissors.settings.ASYMPTOMATIC_PERIOD, 'd'))
        } else {
            scissors.last_contact_min_date = false
        }

        // Scroll down for better UX
        var newHeight = getHeight()
        if (newHeight > scissors.last_page_height) {
            window.scrollBy(0, newHeight - scissors.last_page_height)
        }
        scissors.last_page_height = newHeight
    });
});