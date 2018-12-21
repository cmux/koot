import httpService from './httpService';

const CaseService = httpService.factory(Api.CASE_LIST);

CaseService.transfer = httpService.factory(Api.CASE_TRANSFER);

CaseService.mine = httpService.factory(Api.CASE_MINE);

CaseService.detail = httpService.factory(Api.CASE_DETAIL);

CaseService.repayment = httpService.factory(Api.CASE_REPAYMENT);

CaseService.callList = httpService.factory(Api.CASE_CALL_LIST);

CaseService.bank = httpService.factory(Api.CASE_INFO_BANK);

CaseService.authInfo = httpService.factory(Api.CASE_INFO_AUTH);

CaseService.collect = httpService.factory(Api.CASE_INFO_COLLECT);

export default CaseService;
