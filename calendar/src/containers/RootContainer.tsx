import * as React from "react";
import { Wrapper } from "../components/Styles";
import { apiRequest } from "../utils/Helpers";
import { weekMap, i18n } from "../utils/Consts";

export type Schedule = {
    start: string;
    end: string;
    status: string;
    hh: string;
    mm: string;
}

export type WeekDay = {
    year: string;
    month: string;
    date: string;
    day: string;
    schedules: Schedule[]
    status: string;
}


function RootContainer() {
    const [language, setLanguage] = React.useState<string>("en-US");
    const [schedules, setSchedules] = React.useState<Array<Schedule>>([]);
    const [nextWeekDay, setNextWeekDay] = React.useState<string>("");
    const [weekDays, setWeekDays] = React.useState<Array<WeekDay>>([]);
    const [addTimeStamp, setAddTimeStamp] = React.useState<number>(0);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        const getSchedules = async () => {
            setLoading(true);
            let firstDay = new Date(Number(new Date()) - (new Date()).getDay() * 86400000);
            let weekDayTimeStamp = Number(new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate())) + addTimeStamp;
            let startedAt = Number(new Date()) > weekDayTimeStamp ? (new Date()).toISOString() : (new Date(weekDayTimeStamp)).toISOString();
            const unMergedSchedule: { available: Array<Schedule>, booked: Array<Schedule> } = await apiRequest(
                `https://api.amazingtalker.com/v1/guest/teachers/amy-estrada/schedule?started_at=${startedAt}`,
                "get"
            );

            let schedules: Array<Schedule> = [
                ...unMergedSchedule.available.map(x => {
                    return {
                        ...x,
                        ...{
                            status: "available",
                            hh: (new Date(x.start)).getHours() < 10 ? "0" + (new Date(x.start)).getHours().toString() : (new Date(Date.parse(x.start))).getHours().toString(),
                            mm: (new Date(x.start)).getMinutes() < 10 ? "0" + (new Date(x.start)).getMinutes().toString() : (new Date(Date.parse(x.start))).getMinutes().toString()
                        }
                    };
                }),
                ...unMergedSchedule.booked.map(x => {
                    return {
                        ...x,
                        ...{
                            status: "booked",
                            hh: (new Date(x.start)).getHours() < 10 ? "0" + (new Date(x.start)).getHours().toString() : (new Date(Date.parse(x.start))).getHours().toString(),
                            mm: (new Date(x.start)).getMinutes() < 10 ? "0" + (new Date(x.start)).getMinutes().toString() : (new Date(Date.parse(x.start))).getMinutes().toString()
                        }
                    };
                })
            ];

            let scheduleIds: {
                [index: string]: string
            } = {};
            for (let schedule of schedules) {
                let _start = Date.parse(schedule.start);
                if (!scheduleIds[schedule.start]) scheduleIds[schedule.start] = schedule.end;

                while (Date.parse(schedule.end) - _start > 1800000) {
                    let moreSchedule = { ...schedule };
                    moreSchedule.start = (new Date(_start + 1800000)).toISOString();
                    moreSchedule.hh = (new Date(moreSchedule.start)).getHours() < 10 ? "0" + (new Date(moreSchedule.start)).getHours().toString() : (new Date(Date.parse(moreSchedule.start))).getHours().toString();
                    moreSchedule.mm = (new Date(moreSchedule.start)).getMinutes() < 10 ? "0" + (new Date(moreSchedule.start)).getMinutes().toString() : (new Date(Date.parse(moreSchedule.start))).getMinutes().toString();
                    console.log(moreSchedule);
                    if (!scheduleIds[moreSchedule.start]) {
                        scheduleIds[moreSchedule.start] = moreSchedule.end;
                        schedules.push(moreSchedule);
                    }
                    _start += 1800000;
                }
            }
            setSchedules(schedules.sort((a, b) => Date.parse(a.start) - Date.parse(b.start)));
            setLoading(false);
        };
        getSchedules();
    }, [addTimeStamp]);

    React.useEffect(() => {
        let firstDay = new Date(Number(new Date()) - (new Date()).getDay() * 86400000);
        let weekDayTimeStamp = Number(new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate())) + addTimeStamp;

        let _weekDays = new Array<WeekDay>();
        let _nextWeekDay = (new Date(weekDayTimeStamp + 604800000)).getDate() < 10 ? "0" + (new Date(weekDayTimeStamp + 604800000)).getDate().toString() : (new Date(weekDayTimeStamp + 604800000)).getDate().toString();
        setNextWeekDay(_nextWeekDay);
        for (let i = 0; i < 7; i++) {
            let weekDay = new Date(weekDayTimeStamp);
            _weekDays.push({
                year: weekDay.getFullYear().toString(),
                month: weekDay.getMonth() + 1 < 10 ? "0" + (weekDay.getMonth() + 1).toString() : (weekDay.getMonth() + 1).toString(),
                date: weekDay.getDate() < 10 ? "0" + weekDay.getDate().toString() : weekDay.getDate().toString(),
                day: weekMap[weekDay.getDay()][language],
                schedules: schedules
                    .filter(x => Date.parse(x.start) >= weekDayTimeStamp && Date.parse(x.start) < (weekDayTimeStamp + 86400000)),
                status: Number(new Date()) < weekDayTimeStamp ? "active" : ""
            });
            console.log(schedules
                .filter(x => Date.parse(x.start) >= weekDayTimeStamp && Date.parse(x.start) < (weekDayTimeStamp + 86400000)), _weekDays[i]);
            weekDayTimeStamp += 86400000;
        }
        setWeekDays(_weekDays);
    }, [schedules, language]);

    return (
        <Wrapper>
            <div className="profile-section teacher-schedule with-divider">
                <div id="timeslots"
                    className="teacher-profile-schedule aside-navigation-item">
                    <h3 className="section-title">
                        <span>{i18n["sectionTitle"][language]}</span>
                        <div className="buttion-group">
                            <div className="el-button-group">
                                <button type="button"
                                    className={`el-button ${language === "zh-TW" ? "active" : ""} el-button--default el-button--mini is-plain`}
                                    onClick={() => setLanguage("zh-TW")}>
                                    中文
                                </button>
                                <button type="button"
                                    className={`el-button ${language === "en-US" ? "active" : ""} el-button--default el-button--mini is-plain`}
                                    onClick={() => setLanguage("en-US")}>
                                    Eng
                                </button>
                            </div>
                        </div>
                    </h3>
                    <div className="section-body">
                        <div className="schedule">
                            <div className="schedule-control-box at-control">
                                <div className="buttion-group">
                                    <div className="el-button-group">
                                        <button disabled={addTimeStamp === 0}
                                            type="button"
                                            className={`el-button el-button--default el-button--mini ${addTimeStamp === 0 ? "is-disabled" : ""} is-plain`}
                                            onClick={() => setAddTimeStamp(addTimeStamp - 604800000)}>
                                            <i className="el-icon-arrow-left">
                                            </i>
                                        </button>
                                        <button type="button"
                                            className="el-button el-button--default el-button--mini is-plain"
                                            onClick={() => setAddTimeStamp(addTimeStamp + 604800000)}>
                                            <i className="el-icon-arrow-right">
                                            </i>
                                        </button>
                                    </div>
                                </div>
                                <div className="label-box">{weekDays.length === 7 ? weekDays[0].year + "/" + weekDays[0].month + "/" + weekDays[0].date + " - " + nextWeekDay : ""}</div>
                                <div className="time-zone-description">
                                    <span>{i18n["timeZomeDescription"][language]}</span>
                                </div>
                            </div>
                            {loading ? <div className="loading" >loading...</div> : <div className="at-column-box">
                                {weekDays.map(({ day, date, status, schedules }: WeekDay, i: number) => {
                                    return (
                                        <div className="root" key={i}>
                                            <div className={`column-container ${status} disable_click`}>
                                                <div className="title-box">
                                                    <div className="at-text-center">{day}</div>
                                                    <div className="at-text-center">{date}</div>
                                                </div>
                                                <div className="time-box">
                                                    {schedules.map(({ hh, mm, status }: Schedule, j: number) => {
                                                        return (
                                                            <div className="time-list" key={j}>
                                                                <div className={`time at-text-center is-size-7 ${status}`}>{hh}:{mm}</div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>}
                        </div>
                    </div>
                </div>
            </div>
        </Wrapper>
    );
}

export default RootContainer;
