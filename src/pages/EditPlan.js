import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import styled from "styled-components";
import {Grid} from "../elements";
import {editPlan, getOnePlan} from "../redux/modules/plan";
import {ReactComponent as LeftArrow} from '../img/icon/arrowl.svg';
import {formatDate, formatTime} from "../shared/utils/common";
import dayjs from "dayjs";
import {hourModel, minuteModel} from "../statics/time";
import {DropdownList} from "react-widgets/cjs";
import {penaltyModel} from "../statics/penalty";
import {Input} from "../elements";
import PlanSelectMap from "../components/PlanSelectMap";
import theme from "../styles/theme";
import SetDrawerTime from "../components/SetDrawerTime";
import SetDrawerCalendar from "../components/SetDrawerCalendar";
import MobilePortal from "../components/MobilePortal";

const EditPlan = (props) => {
    const {planUrl} = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const plan = useSelector(state => state.plan.showplan)

    const [name, setName] = useState('')
    const [time, setTime] = useState('')
    const [date, setDate] = useState('')
    const [penalty, setPenalty] = useState('')
    const [place, setPlace] = useState(null)
    const [showMap, setShowMap] = useState(false);
    const [hour, setHour] = useState(null)
    const [minute, setMinute] = useState(null)
    const [amPmType, setAmPmType] = useState('')
    const [placeName, setPlaceName] = useState(place?.name || '');
    const [address, setAddress] = useState(place?.address || '')
    const [lat, setLat] = useState(place?.lat || '');
    const [lng, setLng] = useState(place?.lng || '');
    const planDay = formatDate(plan?.planDate)
    const planTime = formatTime(plan?.planDate)
    useEffect(() => {
        dispatch(getOnePlan(planUrl))
    }, [])

    useEffect(() => {
        if (plan) {
            setName(plan.planName)
            setTime(formatTime(plan.planDate))
            setDate(plan.planDate)
            const penaltyData = penaltyModel.find((model) => model.value === plan.penalty)
            setPenalty(penaltyData)
            setPlace(plan.locationDetail)
            const dayjsDate = dayjs(plan.planDate)
            const _hour = dayjsDate.hour()
            const calcHour = _hour <= 12 ? _hour : _hour - 12
            const _minute = dayjsDate.minute()
            setAmPmType(() => {
                return Number(_hour) <= 12 ? 'am' : 'pm'
            })
            const hourData = hourModel.find((model) => model.value === calcHour.toString())
            const minuteData = minuteModel.find((model) => model.value === _minute.toString())
            setHour(hourData)
            setMinute(minuteData?.id)
            setAddress(plan.locationDetail?.address)
            setLat(plan.locationDetail?.lat)
            setLng(plan.locationDetail?.lng)
            setPlaceName(plan.locationDetail?.name)
        }
    }, [plan])

    useEffect(() => {
        if (hour && minute && amPmType) {
            const _hour = hourModel.find((model) => model.id === hour)
            const _minute = minuteModel.find((model) => model.id === minute)
            setTime(`${amPmType === 'pm' ? parseInt(_hour?.value) + 12 : _hour?.value}:${_minute?.value}`)
        }
    }, [hour, minute, amPmType])

    const changeName = (e) => {
        setName(e.target.value)
    }
    const changePenalty = (data) => {
        setPenalty(data)
    }

    const editPlanBtn = () => {
        if (!validModify()) {
            return
        }
        const data = {
            planUrl,
            planName: name,
            planDate: `${formatDate(date)} ${time}`,
            location: {
                name: placeName,
                lat: lat,
                lng: lng,
                address: address
            },
            penalty: penalty.value,
        }
        dispatch(editPlan({data, navigate}));
    }

    const [open, setOpen] = useState(false)
    const [calendarOpen, setCalendarOpen] = useState(false)

    const toggleMenu = () => {
        setOpen(open => !open);
    }

    const closeMenu = () => {
        setOpen(false)
    }

    const toggleCalendar = () => {
        setCalendarOpen(calendarOpen => !calendarOpen);
    }

    const closeCalendar = () => {
        setCalendarOpen(false)
    }

    const validModify = () => {
        const modifiedDate = dayjs(`${date} ${time}`)
        return name !== plan.planName || modifiedDate !== plan.planDate || penalty !== plan.penalty
    }

    if (!plan) {
        return <div>loading...</div>
    }

    return (
        <Container>
            <HeadLine>
                <LeftArrow
                    style={{
                        position: 'absolute',
                        top: 10,
                        left: 20,
                    }}
                    size="20px"
                    cursor="pointer"
                    onClick={() => {
                        navigate(-1)
                    }}
                />
                <h3>약속을 수정해 주세요</h3>
            </HeadLine>

            <InputBox>
                <input
                    value={name}
                    onChange={changeName}
                    placeholder={plan.planName}
                />
            </InputBox>

            <InputBox>
                <input
                    readOnly
                    value={formatDate(date)}
                    placeholder={planDay}
                    onClick={toggleCalendar}
                />

                <MobilePortal>
                    <ShowCalendar calendarOpen={calendarOpen} onClick={closeCalendar}>
                        <SetDrawerCalendar calendarOpen={calendarOpen} onClose={toggleCalendar}
                                           date={date ? dayjs(date).toDate() : null} setDate={setDate}/>
                    </ShowCalendar>
                </MobilePortal>
            </InputBox>

            <InputBox>
                <input
                    readOnly
                    value={time}
                    placeholder={planTime}
                    onClick={toggleMenu}
                />
            </InputBox>
            <MobilePortal>
                <ShowMenu open={open} onClick={closeMenu}>
                    <SetDrawerTime open={open} onClose={toggleMenu} hour={hour} setHour={setHour} minute={minute}
                                   setMinute={setMinute} amPmType={amPmType} setAmPmType={setAmPmType}/>
                </ShowMenu>
            </MobilePortal>

            <InputBox>
                <Input
                    placeholder={placeName ? placeName : plan.locationDetail?.name}
                    _onClick={() => {
                        setShowMap(true);
                    }}
                    value={placeName}
                />
                {showMap && (
                    <PlanSelectMap
                        setShowMap={setShowMap}
                        setName={setPlaceName}
                        setAddress={setAddress}
                        setLat={setLat}
                        setLng={setLng}
                    />
                )}
            </InputBox>

            <DropBox>
                <DropdownList
                    style={{
                        width: '100%',
                        margin: '14px auto 0 auto',
                        background: `${theme.color.white}`
                    }}
                    dataKey="id"
                    textField="value"
                    value={penalty}
                    onChange={changePenalty}
                    data={penaltyModel}
                />
            </DropBox>

            <Grid bottom="0" padding="16px">
                <button
                    onClick={editPlanBtn}
                    style={{
                        backgroundColor: '#A1ED00',
                        width: '100%',
                        height: '100%',
                        padding: '12px',
                        color: 'black',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: "pointer",
                        fontWeight: 'bold',
                    }}>수정완료
                </button>
            </Grid>
        </Container>
    )
}

export default EditPlan

const Container = styled.div`
  height: 100%;
  background-color: ${theme.color.gray7};
`

const HeadLine = styled.div`
  position: relative;
  width: 100%;
  text-align: center;

  h3 {
    font-size: 20px;
    font-weight: bold;
    padding-top: 20px;
    padding-bottom: 20px;
  }
`

const InputBox = styled.div`
  width: 100%;
  margin: auto;
  box-sizing: border-box;

  input {
    display: flex;
    border: 1px solid #c4c4c4;
    width: 90%;
    padding: 12px 12px;
    margin: 14px auto 0 auto;
    box-sizing: border-box;
    border-radius: 10px;
    background: #ffffff;
    align-items: center;
    justify-content: center;
  }
`

const DropBox = styled.div`
  width: 90%;
  margin: auto;
  box-sizing: border-box;
`

const ShowMenu = styled.div`
  background-color: rgba(255, 255, 255, 0);
  display: flex;
  visibility: ${({open}) => open ? 'visible' : 'hidden'};
  top: 0;
  left: 0;
  align-items: flex-end;
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 1;
  transition: visibility 0.2s;
`

const ShowCalendar = styled.div`
  background-color: rgba(255, 255, 255, 0);
  display: flex;
  visibility: ${({calendarOpen}) => calendarOpen ? 'visible' : 'hidden'};
  top: 0;
  left: 0;
  align-items: flex-end;
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 1;
  transition: visibility 0.2s;
`