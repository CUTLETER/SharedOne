import React, {useState, useEffect, useRef} from 'react';
import ReactDOM from "react-dom/client";
import './Order.css'
import './OrderRegist.css'
import './OrderModalDetail.css'
import useCheckboxManager from "../js/CheckboxManager";
import axios from 'axios';

function Order() {


    const {
        allCheck,
        checkItem,
        showDelete,
        handleMasterCheckboxChange,
        handleCheckboxChange,
        handleDelete
    } = useCheckboxManager(setOrder);

    // 주문 데이터를 저장하는 상태
    const [order, setOrder] = useState([]);

    //주문목록 불러오기
    useEffect( () => {

        let effectOrder = async () => {
            try{
                let data = await fetch('/order/orderList').then(res => res.json());

                const transfomData = data.map(item => ({
                    orderNo: item.orderNo,
                    /*상품명은 상세보기 만들면 그거랑 연결 할 예정*/
                    customerN: item.customer.customerName,
                    manager:item.employee.employeeName,
                    status:item.confirmStatus,
                    date:item.regDate
                }));

                setOrder(transfomData);
                console.log(transfomData);
            } catch (error){
                console.error('error발생함 : ', error);
            }
        }

        effectOrder();
    }, []);


// --- 테이블 정렬 기능

    // 정렬 상태와 방향을 저장하는 상태
    const [sortConfig, setSortConfig] = useState({key: '', direction: 'ascending'});

    // 정렬 함수
    const sortData = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        const sortOrder = [...order].sort((a, b) => { //order배열 정렬(매개변수 비교)
            if (a[key] < b[key]) { // key는 변수명임 (ex. orderNo, manage, title ...)
                return direction === 'ascending' ? -1 : 1; //
            }
            if (a[key] > b[key]) {
                return direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
        setOrder(sortOrder);
        setSortConfig({key, direction});
    };


// --- 테이블 정렬 기능

    /*==============jsy조건 검색==============*/
    const [prod, setProd] = useState([]);
    const [mycustomer, setMycustomer] = useState([]);

    const [confirmState] = useState(['임시저장', '대기', '승인', '반려']);//결재상태배열
    const [selectedConfirm, setSelectedConfrim] = useState('');

    //상품명 목록 Data
    useEffect ( () => {
        let effectProd = async() => {
            let getProd = await fetch('/product/products').then(res => res.json());
            setProd(getProd);
        }
        effectProd();
    },[]);

    //고객명 목록 data
    useEffect ( () => {
        let effectCustomer = async() => {
            let getCustomer = await fetch('/customer/customerALL').then(res => res.json());
            setMycustomer(getCustomer);//주문필터
            setOrderCustomer(getCustomer);//주문등록폼
        }
        effectCustomer();
    },[]);


    //입력된 조건 데이터 보내기
    const [form, setForm] = useState({});

    const handleChange = (e) => {
        let copy = {...form, [e.target.id]: e.target.value};
        setForm(copy);
        console.log(copy);
    }


    const handleSearchBtn = async() => {
        //서버로 데이터 보내기
        const date = form.date || null;
        const orderNo = form.orderNo|| null;
        const prod = form.prod || null;
        const mycustomer = form.mycustomer || null;
        const manager = form.manager || null;
        const status = form.selectedConfirm || null;

        const res = await axios.post('/order/searchSelect', {
            inputDate: date,
            inputOrderNo: orderNo,
            inputProdNo: prod,
            inputCustomerNo: mycustomer,
            inputManager: manager,
            inputState: status
        }); //{매개변수 : 전달 값}

        const searchOrderData = res.data; //이렇게 먼저 묶고 반복 돌려야함.

        if(Array.isArray(searchOrderData)){
            const getSearchOrder = searchOrderData.map(item => ({ //res.data.map안된다는 소리
                orderNo: item.orderNo,
                /*상품명은 상세보기 만들면 그거랑 연결 할 예정*/
                customerN: item.customer.customerName,
                manager:item.employee.employeeName,
                status:item.confirmStatus,
                date:item.regDate
            }))

            setOrder(getSearchOrder);
        } else {
            console.log('서버로부터 받은 데이터가 배열이 아닙니다.', searchOrderData);
        }




    };


    /*---------------jsy조건 끝---------------*/

    /*==============주문 등록 폼==============*/

    const [orderCustomer, setOrderCustomer] = useState('');

    const handleCustomer = () => {

        //상품코드와 고객코드에 맞는 판매가 select
        let effectPrice = async() => {
            const orderCustomer = form.orderCustomer || null;

            //주문등록폼 고객사명 서버로 보내기
            const resp = await axios.post('/order/getPrice',{
                inputOrderCustomerNo: orderCustomer
            })

            const OrderCustomerData = resp.data;
            if(Array.isArray(OrderCustomerData)){
                const getOrderCustomer = OrderCustomerData.map(item => ({
                    orderCustomer: item.customerName
                }))
                setOrderCustomer(getOrderCustomer);
            } else {
                console.log('등록폼 에러', OrderCustomerData);
            }
        }
    }







    /*---------------주문 등록 끝---------------*/

// ---  모달창 띄우는 스크립트
    const [isVisibleDetail, setIsVisibleDetail] = useState(false);

    const handleAddClickDetail = () => {
        setIsVisibleDetail(true);
    };

    const handleCloseClickDetail = () => {
        setIsVisibleDetail(false);
    };

    const [isVisibleCSV, setIsVisibleCSV] = useState(false);

    const handleAddClickCSV = () => {
        setIsVisibleCSV((prevState) => !prevState);
    };


    const [isVisible, setIsVisible] = useState(false);

    const handleAddClick = () => {
        setIsVisible(true);
    };

    const handleCloseClick = () => {
        setIsVisible(false);
    };



/* 아래부터는 상세보기 관련된 모든 것 */
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModifyModalVisible, setIsModifyModalVisible] = useState(false);

    /*상세보기 창 열기*/
    const handleModify = (item) => {
        setSelectedOrder(item);
        setIsModifyModalVisible(true);
    };

    /*창 닫기*/
    const handleModifyCloseClick = () => {
        setIsModifyModalVisible(false);
    }

    /*입력값 변동사항 있을 시*/
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedOrder(prev => ({
            ...prev,
            [name]: value
        }));
    };

    /*변동사항 update 처리*/
    const handleSaveChange = async () => {
        try {
            // API 호출로 수정된 정보 저장
            const response = await axios.put(`/order-detail/${selectedOrder.orderNo}`, selectedOrder);
            if (response.status === 200) {
                alert('주문 정보가 성공적으로 수정되었습니다.');
                setIsModifyModalVisible(false);
                // 주문 목록 새로고침
                effectOrder();
            }
        } catch (error) {
            console.error('주문 수정 중 오류 발생:', error);
            alert('주문 수정에 실패했습니다. 다시 시도해주세요.');
        }
    };



    return (
        <div>

            <div className="pageHeader"><h1><i class="bi bi-menu-up"></i>주문 관리</h1></div>

            <div className="main-container">
                <div className="filter-containers">
                    <div className="filter-container">
                        <div className="filter-items">

                            <div className="filter-item">
                                <label className="filter-label" htmlFor="date">등록 일자</label>
                                <input className="filter-input" type="date" id="date" value={form.date || ''} onChange={handleChange} required />
                            </div>

                            <div className="filter-item">
                                <label className="filter-label" htmlFor="orderNo">주문 번호</label>
                                <input className="filter-input" type="text" id="orderNo" value={form.orderNo || ''} onChange={handleChange} placeholder="주문 번호" required/>
                            </div>

                            <div className="filter-item">
                                <label className="filter-label" htmlFor="mycustomer">고객 명</label>
                                <select id="mycustomer" className="filter-input" value={form.mycustomer || ''} onChange={handleChange} >
                                    <option value="">선택</option>
                                    {mycustomer.map((customer) => (
                                        <option key={customer.customerNo} value={customer.customerNo}>
                                            {customer.customerName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-item">
                                <label className="filter-label" htmlFor="manager">담당자명</label>
                                <input className="filter-input" type="text" id="manager" value={form.manager || ''} onChange={handleChange}  placeholder="담당자명" required/>
                            </div>

                            <div className="filter-item">
                                <label className="filter-label" htmlFor="prod">상품명</label>
                                <select id="prod" className="filter-input" value={form.prod || ''} onChange={handleChange} >
                                    <option value="">선택</option>
                                        {prod.map((product) => (
                                            <option key={product.productNo} value={product.productNo}>
                                                {product.productName}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="filter-item">
                                <label className="filter-label" htmlFor="selectedConfirm">결재 여부</label>
                                <select className="filter-select" id="selectedConfirm" value={form.selectedConfirm || ''} onChange={handleChange}>
                                    <option value="">전체</option>
                                    {confirmState.map( state => (
                                        <option key={state} value={state}>
                                            {state}
                                        </option>
                                    ))}
                                </select>
                            </div>


                        </div>
                    </div>
                    <div className="button-container">
                        <button type="button" className="search-btn" id="searchOrder" onClick={handleSearchBtn}><i
                        className="b    i bi-search search-icon"></i>
                        </button>
                    </div>
                </div>

                <button className="btn-common add" type="button" onClick={handleAddClick}>
                    주문 등록
                </button>

                <table className="seacrh-table">
                    {showDelete && <button className='delete-btn' onClick={handleDelete}>삭제</button>}
                    <thead>
                    <tr>
                        <th><input type="checkbox" /></th>
                        <th>No.</th>
                        <th>
                            주문 번호
                            <button className="sortBtn" onClick={() => sortData('orderNo')}>
                                {sortConfig.key === 'orderNo' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '-'}
                            </button>
                        </th>
                        <th>
                            담당자명
                            <button className="sortBtn" onClick={() => sortData('manager')}>
                                {sortConfig.key === 'manager' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '-'}
                            </button>
                        </th>
                        <th>
                            고객명
                            <button className="sortBtn" onClick={() => sortData('customerN')}>
                                {sortConfig.key === 'customerN' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '-'}
                            </button>
                        </th>
                        <th>
                            결재 상태
                            <button className="sortBtn" onClick={() => sortData('status')}>
                                {sortConfig.key === 'status' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '-'}
                            </button>
                        </th>
                        <th>
                            주문 등록 일자
                            <button className="sortBtn" onClick={() => sortData('date')}>
                                {sortConfig.key === 'date' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '-'}
                            </button>
                        </th>
                        <th>
                        주문 상세
                        <button className="sortBtn" onClick={() => sortData('details')}>
                        {sortConfig.key === 'details' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '-'}
                        </button>
                        </th>


                    </tr>
                    </thead>
                    <tbody>
                    {order.length > 0 ? (
                        order.map((item, index) => (

                                <tr key={`${item.orderNo}`} className={checkItem[index+1] ? 'selected-row' : ''} onDoubleClick={() => {
                                handleModify(item)
                                }}>
                                <td>
                                    <input
                                    type="checkbox"
                                    checked={checkItem[index + 1] || false}
                                    onChange={handleCheckboxChange}
                                    />
                                </td>
                                <td>{index + 1}</td>
                                <td>{item.orderNo}</td>
                                <td className="ellipsis">{item.manager}</td>
                                <td className="ellipsis">{item.customerN}</td>
                                <td>{item.status}</td>
                                <td>{item.date}</td>
                                    {/*버튼도 더블 클릭해야 상세보기 창이 열려서 수정함 - ysh*/}
                                <td><button className="btn-common" onClick={() => handleModify(item)}> 상세보기 </button> </td>
                                {/*<td>{item.prodName}</td>*/}
                                </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8">등록된 주문이 없습니다😭</td>
                        </tr>
                    )}
                    <tr>
                        <td colSpan="7"></td>
                        <td colSpan="1"> {order.length} 건</td>
                    </tr>

                    </tbody>
                </table>
            </div>

{/* 여기 아래는 모달이다. */}

{/*jsy 주문등록 모달창 시작*/}
            {isVisible && (
                <div class="confirmRegist">
                    <div class="fullBody">
                        <div class="form-container">
                            <button className="close-btn" onClick={handleCloseClick}> &times;
                            </button>
                            <div class="form-header">
                                <h1>주문 등록</h1>

                                <div class="btns">
                                    <div class="btn-add2">
                                            <button> 임시저장 </button>

                                    </div>
                                    <div class="btn-close">
                                          <button> 등록하기</button>
                                    </div>
                                </div>
                            </div>

                            {/*주문정보-헤더*/}
                            <div class="RegistForm">
                                <table class="formTable">

                                    <tr>

                                        <th colspan="1"><label htmlFor="orderCustomer">고객사 명</label></th>
                                        <td colspan="3">
                                        <select id="orderCustomer" value={form.orderCustomer || ''} onChange={handleChange}>
                                            <option>선택</option>
                                            {orderCustomer.map(customer => (
                                                <option key={customer.customerNo} value={customer.customerNo}>
                                                    {customer.customerName}
                                                </option>
                                            ))
                                            }
                                        </select></td>

                                        <th colspan="1"><label htmlFor="">납품 요청일</label></th>
                                        <td colspan="3"><input type="date" placeholder="필드 입력"/></td>

                                    </tr>


                                    <tr>
                                        <th colspan="1"><label htmlFor="">담당자명</label></th>
                                        <td colspan="3"><input type="text" placeholder="필드 입력"/></td>


                                        <th colspan="1"><label htmlFor="">결재자</label></th>
                                        <td colspan="3"><input type="text" placeholder="필드 입력"/></td>

                                    </tr>
                                </table>
                            </div>

                            <div className="bookSearchBox">
                            <div className="bookSearch">
                                <input type="text" />
                                <button type="button" className="btn-common">추가</button>
                            </div>
                            <div className="bookResultList">
                                <ul>
                                {orderCustomer.map((customer) => (
                                    <li key={customer.customerNo}>
                                    {customer.customerName}
                                    </li>
                                ))}
                                </ul>
                            </div>
                            </div>



                            <div class="RegistFormList">
                                <div style={{fontWeight: 'bold'}}> 총 N 건</div>
                                <table class="formTableList">
                                    <thead>
                                        <tr>
                                            <th><input type="checkbox"/></th>
                                            <th>no</th>
                                            <th>상품 종류</th>
                                            <th>상품 명</th>
                                            <th>저자</th>
                                            <th>판매가</th>
                                        </tr>
                                    </thead>
                                <tbody>
                                    {prod.map((product, index) => (
                                        <tr key={index}>
                                            <td><input type="checkbox" /></td>
                                            <td>{index + 1}</td>
                                            <td>{product.productCategory}</td>
                                            <td>{product.productName}</td>
                                            <td>{product.productWriter}</td>
                                            {/*<td>{판매가}</td>*/}
                                        </tr>
                                    ))}
                                    <tr style={{fontWeight: 'bold'}}>
                                        <td colspan="6"> 합계</td>
                                        <td colspan="2"> 13,000,000</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>

                        <div class="RegistFormList">
                                    <div style={{fontWeight: 'bold'}}> 총 N 건</div>
                                    <table class="formTableList">
                                        <thead>
                                            <tr>
                                                <th><input type="checkbox"/></th>
                                                <th>no</th>
                                                <th>2상품 종류</th>
                                                <th>2상품 명</th>
                                                <th>2상품 수량</th>
                                                <th>2총 액</th>
                                                <th>2판매시작날짜</th>
                                                <th>2판매종료날짜</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td><input type="checkbox"/></td>
                                                <td>1</td>
                                                <td>제품공고1</td>
                                                <td>EA</td>
                                                <td>EA</td>
                                                <td>재품창고1</td>
                                                <td>L2017-11-260001</td>
                                                <td>4,900</td>
                                            </tr>

                                            <tr style={{fontWeight: 'bold'}}>
                                                <td colspan="6"> 합계</td>
                                                <td colspan="2"> 13,000,000</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>


                        </div>



                    </div>
                </div>

            )}
            {/* 모달창의 끝  */}

{/* 상세 보기 모달창 - 선화*/}
 {isModifyModalVisible && (

        <div className="confirmRegist">
                           <div className="fullBody">
                               <div className="form-container">
                                   <button className="close-btn" onClick={handleModifyCloseClick}> &times; </button>
                                   <div className="form-header">
                                       <h1>상세 조회</h1>
                                       <div className="btns">
                                           <div className="btn-add">
                                               <button type="button">수정하기</button>
                                               {/* Changed type to "button" */}
                                           </div>
                                       </div>
                                   </div>
                                   <form className="RegistForm">
                                       <table className="formTable">
                                           <tbody>
                                           <tr>
                                               {/*상품 종류 없애고 배치 살짝 바꿈 1 - ysh*/}
                                               <th colSpan=""><label htmlFor="confirmTitle">주문번호</label></th>
                                               <td colSpan="">
                                                   <input
                                                       type="text"
                                                       name="orderNo"
                                                       value={selectedOrder.orderNo}
                                                       readOnly  // 주문번호는 수정 불가능하게 유지
                                                   />
                                               </td>
                                               <th colSpan=""><label htmlFor="confirmTitle">주문 등록일</label></th>
                                               <td colSpan="">
                                                   <input
                                                       type="date"
                                                       name="date"
                                                       value={selectedOrder.date}
                                                       onChange={handleInputChange}
                                                   />
                                               </td>
                                               <th colSpan=""><label htmlFor="picName">담당자명</label></th>
                                               <td colSpan="">
                                                   <input
                                                       type="text"
                                                       name="manager"
                                                       value={selectedOrder.manager}
                                                       onChange={handleInputChange}
                                                   />
                                               </td>


                                           </tr>


                                           <tr>
                                               {/*상품 종류 없애고 배치 살짝 바꿈2 - ysh*/}
                                               <th colSpan=""><label htmlFor="customerName">고객명</label></th>
                                               <td colSpan="">
                                                   <input
                                                       type="text"
                                                       name="customerN"
                                                       value={selectedOrder.customerN}
                                                       onChange={handleInputChange}
                                                   />
                                               </td>
                                               <th colSpan=""><label htmlFor="productName">상품명</label></th>
                                               <td colSpan="">
                                                   <input
                                                       type="text"
                                                       name="productName"

                                                       placeholder="필드 입력"
                                                   />
                                               </td>
                                               <th colSpan=""><label htmlFor="qty">상품수량</label></th>
                                               <td colSpan="">
                                                   <input
                                                       type="text"
                                                       name="orderQty"

                                                       placeholder="필드 입력"
                                                   />
                                               </td>
                                           </tr>
                                           <tr>
                                               <th colSpan=""><label htmlFor="customPrice">판매가</label></th>
                                               <td colSpan="">
                                                   <input
                                                       type="text"
                                                       name="customPrice"

                                                       placeholder="필드 입력"
                                                   />
                                               </td>
                                               <th colSpan=""><label htmlFor="totalAmount">총 금액</label></th>
                                               <td colSpan="">
                                                   <input
                                                       type="text"
                                                       name="totalAmount"

                                                       placeholder="필드 입력"
                                                   />
                                               </td>
                                               <th colSpan=""><label htmlFor="delDate">납품 요청일</label></th>
                                               <td colSpan="">
                                                   <input
                                                       type="date"
                                                       name="delDate"

                                                   />
                                               </td>
                                           </tr>


                                           </tbody>
                                       </table>

                                         <table className="formTable2">

                                             <tr>
                                                 <th colSpan="1"><label htmlFor="approver">결재자</label></th>
                                                 <td colSpan="3">
                                                     <input
                                                         type="text"
                                                         name="approver"

                                                         placeholder="필드 입력"
                                                     />
                                                 </td>
                                                 <th colSpan="1"><label htmlFor="approvalStatus">결재 여부</label></th>
                                                 <td colSpan="">
                                                     <select
                                                         name="status"
                                                         value={selectedOrder.status}
                                                         onChange={handleInputChange}
                                                     >
                                                         <option value="임시저장">임시저장</option>
                                                         <option value="대기">대기</option>
                                                         <option value="승인">승인</option>
                                                         <option value="반려">반려</option>
                                                     </select>
                                                 </td>
                                             </tr>

                                             <tr>
                                                 <th colSpan="1"><label htmlFor="remarks">비고</label></th>
                                                 <td colSpan="8">
                                                     <textarea>  </textarea>
                                                 </td>
                                             </tr>


                                         </table>


                                   </form>

                                   <div className="RegistFormList">
                                       <div style={{fontWeight: 'bold'}}> 총 건</div>
                                       <table className="formTableList">
                                           <thead>
                                           <tr>
                                               <th><input type="checkbox"
                                                          /></th>
                                               <th>No</th>
                                               <th>고객명</th>
                                               <th>상품명</th>
                                               <th>상품 수량</th>
                                               <th>판매가</th>
                                               <th>총 금액</th>
                                               <th>납품 요청일</th>
                                               <th>담당자</th>
                                           </tr>
                                           </thead>
                                           <tbody>

                                           <tr style={{fontWeight: 'bold'}}>
                                               <td colSpan="8"> 합계</td>
                                               <td colSpan="2">

                                               </td>
                                           </tr>
                                           </tbody>
                                       </table>
                                       {showDelete && (
                                           <button className='delete-btn' onClick={handleDelete}>삭제</button>
                                       )}
                                   </div>
                               </div>
                           </div>
                       </div>

            )}


            </div>
                );
            }

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
<Order />
);