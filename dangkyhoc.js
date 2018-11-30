$registrationAvailable = true;
let buttonArea = $('.col-md-4.col-md-offset-0')[0];
$(`
    <button style="margin-bottom: 5px;" class="btn btn-success confirm-registration">
        <i class="icon-save"></i> Ghi nhận
    </button>
`).appendTo(buttonArea);
$(".sel-dsdk-mod").val("1").change();

function format_string(str) {
    if (typeof str === 'string' && str.length > 0) {
        let words = str.split(/\s/);
        words = words.filter((word) => (word !== ''));
        return words.join(' ');
    } else {
        return '';
    }
};

function get_time_str() {
    return (new Date()).toLocaleTimeString();
};

function pick_course({course_id, course_name, crdid, rowindex, numcrd}) {
    if (prer_message = CheckPrerequisite(crdid), prer_message == "") {
        if (register_message = Pending(rowindex), register_message == "") {
            DSDK($(".sel-dsdk-mod").select2("val"));
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
};

function auto_pick(wish_list = {}) {
    const picked_courses = [];
    const checkboxes = $(".order").toArray();
    const available_courses = checkboxes.map((checkbox) => {
        const row = $($(checkbox).parent()).parent();
        const course_id = format_string($($(row).children()[4]).text()); // Mã môn
        const course_name = format_string($($(row).children()[1]).text()); // Tên môn
        const crdid = $(checkbox).attr("data-crdid"); // Check tiên quyết
        const rowindex = $(checkbox).attr("data-rowindex"); // Đăng ký môn
        const numcrd = $(checkbox).attr("data-numcrd"); // Số tín chỉ
        return {course_id, course_name, crdid, rowindex, numcrd};
    });
    available_courses.forEach((course) => {
        if (wish_list[course.course_id]) {
            if (pick_course(course)) {
                picked_courses.push(course);
            }
        }
    });
    console.log(picked_courses);
};

function auto_submit(interval_time = 2) {
    const _BASE_URL = 'http://dangkyhoc.vnu.edu.vn';
    cancel_submit();
    window.autosubmit = setInterval(function() {
        $.post(
            _BASE_URL + '/xac-nhan-dang-ky/' + $registrationMode,
            null, 
            (data) => {
                console.log(get_time_str(), data);
                if (data.message !== 'Ngoài thời hạn đăng ký') {
                    cancel_submit();
                }
            }, 
            "json"
        );
    }, 1000 * interval_time);
};

function cancel_submit() {
    if (window.autosubmit) {
        clearInterval(window.autosubmit);
    }
};

const tool_ui = $(`
    <div id="tool-ui-panel" style="margin: 10px;">
        <div class="row form-group">
            <div class="col-sm-12">
                <label for="courses-input">Chọn môn theo mã:</label>
                <textarea id="courses-input" class="form-control" rows="5"></textarea>
            </div>
            <div class="col-sm-12" style="margin-top: 10px">
                <button id="courses-pick-button" class="btn btn-primary pull-right">Chọn môn</button>
            </div>
        </div>
        <div class="row form-group">
            <div class="col-sm-12">
                <label for="interval-time-input">Khoảng giây giữa các lần nộp môn:</label>
                <input id="interval-time-input" class="form-control" />
            </div>
            <div class="col-sm-12" style="margin-top: 10px">
                <button id="interval-request-button" class="btn btn-success pull-right">Nộp</button>
                <button id="interval-cancel-request-button" class="btn btn-secondary pull-right" style="margin-right: 5px;">Ngừng nộp</button>
            </div>
        </div>
    </div>
`);
$('#main-nav').append(tool_ui);
$('#courses-pick-button').click(function() {
    const courses_str = $('#courses-input').val() || '';
    const courses = courses_str.split(/\.|,|;/);
    const wish_list = {}
    courses.forEach(course => {
        wish_list[format_string(course)] = true;
    });
    auto_pick(wish_list);
});
$('#interval-request-button').click(function() {
    const interval_time = parseInt($('#interval-time-input').val()) || 2;
    auto_submit(interval_time);
});
$('#interval-cancel-request-button').click(function() {
    cancel_submit();
});

