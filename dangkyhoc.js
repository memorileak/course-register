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
    const wish_courses = [];
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
            wish_courses.push(course);
            if (pick_course(course)) {
                picked_courses.push(course);
            }
        }
    });
    console.log('Wish:   ', wish_courses);
    console.log('Picked: ', picked_courses);
};

function auto_submit(interval_time = 2) {
    cancel_submit();
    window.autosubmit = setInterval(function() {
        submit_courses((data) => {
            console.log(get_time_str(), ' Submit: ', data);
            if (data.message.substring(0, 18) === 'Đăng ký thành công') {
                cancel_submit();
            }
        });
    }, 1000 * interval_time);
};

function cancel_submit() {
    if (window.autosubmit) {
        clearInterval(window.autosubmit);
    }
};

function auto_watch(rowindexes, interval_time = 2) {
    cancel_watch();
    window.autowatch = setInterval(function() {
        rowindexes.forEach(rowindex => {
            grab_course(rowindex, (data) => {
                console.log(get_time_str(), ' Watch: ', data);
            });
        });
    }, 1000 * interval_time);
};

function cancel_watch() {
    if (window.autowatch) {
        clearInterval(window.autowatch);
    }
};


function grab_course(rowindex, onSuccess) {
    pend_course(rowindex, (data) => {
        if (data.message === '') {
            submit_courses((res) => {
                onSuccess(res);
            });
        }
    });
};

function submit_courses(onSuccess) {
    const _BASE_URL = 'http://dangkyhoc.vnu.edu.vn';
    $.post(
        _BASE_URL + '/xac-nhan-dang-ky/' + $registrationMode,
        null, 
        onSuccess,
        "json"
    );
};

function pend_course(rowindex, onSuccess) {
    const _BASE_URL = 'http://dangkyhoc.vnu.edu.vn';
    const route = "/chon-mon-hoc/" + rowindex + "/" + $registrationMode + "/" + $dsdkMod;
    $.ajax({
        type: "POST", 
        cache: false, 
        url: _BASE_URL + route, 
        dataType: "json", 
        success: onSuccess
    });
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
                <label for="interval-submit-input">Chu kỳ giây nộp môn:</label>
                <input id="interval-submit-input" class="form-control" />
            </div>
            <div class="col-sm-12" style="margin-top: 10px">
                <button id="autosubmit-button" class="btn btn-success pull-right">Nộp</button>
                <button id="cancel-autosubmit-button" class="btn btn-secondary pull-right" style="margin-right: 5px;">Ngừng nộp</button>
            </div>
        </div>
        <div class="row form-group">
            <div class="col-sm-12">
                <label for="rowindexes-input">Canh môn bằng rowindex:</label>
                <input id="rowindexes-input" class="form-control" />
            </div>
            <div class="col-sm-12" style="margin-top: 10px">
                <label for="interval-watch-input">Chu kỳ giây chộp môn:</label>
                <input id="interval-watch-input" class="form-control" />
            </div>
            <div class="col-sm-12" style="margin-top: 10px">
                <button id="autowatch-button" class="btn btn-info pull-right">Canh</button>
                <button id="cancel-autowatch-button" class="btn btn-secondary pull-right" style="margin-right: 5px;">Ngừng canh</button>
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
$('#autosubmit-button').click(function() {
    const interval_time = parseFloat($('#interval-submit-input').val()) || 2;
    auto_submit(interval_time);
});
$('#cancel-autosubmit-button').click(function() {
    cancel_submit();
});

$('#autowatch-button').click(function() {
    const rowindexes_str = $('#rowindexes-input').val() || '';
    const rowindexes = rowindexes_str.split(/\.|,|;/);
    const interval_time = parseFloat($('#interval-watch-input').val()) || 2;
    auto_watch(rowindexes, interval_time);
});
$('#cancel-autowatch-button').click(function() {
    cancel_watch();
});

