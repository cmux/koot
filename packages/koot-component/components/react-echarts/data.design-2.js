// 维度：日期，产品，国家，渠道，版本
// 指标(数据项)：新增用户，日活， 主动活跃， 沉默用户，登陆时长
// 粒度：年，月，日，时，分，秒
// 计算：同比(stc: same time comparison/相同时间比较)
//      环比(ctc: continuous time comparison/连续时间比较)
//      相对于所选的时间粒度
//          同比上年同月
//          同比上月同日
//          同比上日同时
//          同比上时同分
//          同比上分同秒

// 维度名（dimension name

// 维度
// group_by:        date, product, country, channel, version
// -----------------------------------------------------------
// 指标
// keys:            [new_user, active, ...]
// -----------------------------------------------------------
// 用户搜索选择的时间段
// compare:         date1, date2
// -----------------------------------------------------------
// 粒度
// compare_type:    year, month, week, day, hour, minute, second
// -----------------------------------------------------------
// 返回数据结构
//      flat:   平铺 适用于表格系统
//      embed:  嵌入 适用于图表系统
// response_data_structure: 'flat || embed'
// -----------------------------------------------------------

// 排序相关
// sort_by: some_key
// sort: 'desc',
// sort: 'asc'

// 平铺数据格式下的分页结构
// response_data_structure === 'flat'
// pagination: {
//     page: 1,
//     pageSize: 10,
//     total: 100
// }

// requestData = {
//     group_by: 'date', 'product'
//     keys: 'new_user', 'active',
//     compare: 'start_time', 'end_time',
//     compare_type: 'day',
//     response_data_structure: 'embed',
//     sort_by: 'date',
//     sort: 'desc',
//     page: 1,
//     pageSize: 10,
// }

const data = {
    list: [],
    pagination: {
        pageIndex: 1,
        pageSize: 10,
        total: 100
    }
};

const dataDesign = {
    code: 200,
    data: {
        source: [
            {
                name: 'pt-1',
                // .. 这一组数据统计信息
                dataset: [
                    {
                        date: '2018-12-11',
                        service_active: 5997926
                    },
                    {
                        date: '2018-12-12',
                        service_active: 5997926
                    },
                    {
                        date: '2018-12-13',
                        service_active: 5997926
                    }
                ]
            },
            {
                name: 'pt-2',
                // .. 这一组数据统计信息
                dataset: [
                    {
                        date: '2018-12-11',
                        service_active: 5997926
                    }
                    //...
                ]
            }
        ]
    },
    msg: ''
};
// const dataDesign = {
//     code: 200,
//     data: {
//         source: [
//             {
//                 name: 'pt-1',
//                 // .. 这一组数据统计信息
//                 dataset: [
//                     {
//                         "date": "2018-12-11",
//                         "service_active": 5997926,
//                     },
//                     {
//                         "date": "2018-12-12",
//                         "service_active": 5997926,
//                     },
//                     {
//                         "date": "2018-12-13",
//                         "service_active": 5997926,
//                     }
//                 ]
//             },
//             {
//                 name: 'pt-2',
//                 // .. 这一组数据统计信息
//                 dataset: [
//                     {
//                         "date": "2018-12-11",
//                         "service_active": 5997926,
//                     },
//                     //...
//                 ]
//             },
//         ]
//     },
//     msg: '',
// }

const dataDesing1 = [
    {
        name: 'pt-1',
        // .. 这一组数据统计信息
        data: [
            {
                date: '2018-12-11',
                service_active: 5997926,
                active_user: 1370398,
                new_user: 189880,
                silent_user: 4627528,
                regular_user: 1180518,
                ave_online_time: 0,
                events: ['30100578全量']
            }
        ]
    },
    {
        name: 'pt-2',
        // .. 这一组数据统计信息
        data: [
            {
                date: '2018-12-11',
                service_active: 5997926,
                active_user: 1370398,
                new_user: 189880,
                silent_user: 4627528,
                regular_user: 1180518,
                ave_online_time: 0,
                events: ['30100578全量']
            }
        ]
    }
];

const dataDesign2 = [
    {
        'pt-1__date': '2018-12-11',
        'pt-1__service_active': 5997926,
        'pt-1__active_user': 1370398,
        'pt-1__new_user': 189880,
        'pt-1__silent_user': 4627528,
        'pt-1__regular_user': 1180518,
        'pt-1__ave_online_time': 0,
        'pt-1__events': ['30100578全量'],
        'pt-2__date': '2018-12-11',
        'pt-2__service_active': 5997926,
        'pt-2__active_user': 1370398,
        'pt-2__new_user': 189880,
        'pt-2__silent_user': 4627528,
        'pt-2__regular_user': 1180518,
        'pt-2__ave_online_time': 0,
        'pt-2__events': ['30100578全量']
    }
];

const dataDesign3 = [
    [
        'date',
        'service_active',
        'active_user',
        'new_user',
        'silent_user',
        'regular_user'
    ],
    ['2018-12-11', 5997926, 1370398, 189880, 4627528, 1180518, 0]
];

export default dataDesign;
