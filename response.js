//get price
// {
// market: 'KRW-MATIC',
// trade_date: '20211230',
// trade_time: '010301',
// trade_date_kst: '20211230',
// trade_time_kst: '100301',
// trade_timestamp: 1640826181000,
// opening_price: 3045,
// high_price: 3065,
// low_price: 2960,
// trade_price: 3015,
// prev_closing_price: 3045,
// change: 'FALL',
// change_price: 30,
// signed_change_price: -30,
// signed_change_rate: -0.0098522167,
// trade_volume: 33.16749585,
// acc_trade_price: 22995549776.336945,
// acc_trade_price_24h: 245605930495.708,
// acc_trade_volume: 7641565.03767242,
// acc_trade_volume_24h: 80197035.75255562,
// highest_52_week_price: 5000,
// highest_52_week_date: '2021-10-15',
// lowest_52_week_price: 1350,
// lowest_52_week_date: '2021-10-15',
// timestamp: 1640826181707
// }

// orders
// {
//     uuid: '4418a786-b08a-4fcd-8200-8b5ca33a245b',
//     side: 'bid',
//     ord_type: 'price',
//     price: '5000.0',
//     state: 'wait',
//     market: 'KRW-MATIC',
//     created_at: '2021-12-30T10:05:27+09:00',
//     volume: null,
//     remaining_volume: null,
//     reserved_fee: '2.5',
//     remaining_fee: '2.5',
//     paid_fee: '0.0',
//     locked: '5002.5',
//     executed_volume: '0.0',
//     trades_count: 0
//   }

// 1. 텔레그램 메뉴 구성

// # 코인 리스트 등록
//  - 거래할 코인 리스트 등록 (whitelist)
//  - 리스트 삭제

// # 구매
//  - 마켓가 구매
//  - 리밋

// # 설정
//  - 모드 - 자동/수동
//  - 매도임계치 - % 값 (해당 값 도달 시 자동 매도)
//  - 매수설정 : coinlist의 가격

// # 현황 표시
//  - 잔액 조회
//  - 코인별 수익률 조희

// bot.js (main)
//  - telegram 인터페이스
//  - adduser : 업비트 키 등록

// account.js
//  - user info
//  - coin list
//  - whitlelist
//  - blacklist

// observer.js
//  - 코인 가격의 모니터링

// upbitapi.js
//  - 코인 시세 조회
//  - 매수/매도 주문
