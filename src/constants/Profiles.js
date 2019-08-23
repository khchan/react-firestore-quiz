import AngelaHo from '../assets/angela-ho-sophia.jpg';
import AnnaChan from '../assets/anna-chan-sophia.jpg';
import DaveYu from '../assets/dave-yu-carl.jpg';
import EdwinWu from '../assets/edwin-wu-carl.jpg';
import FlorenceChan from '../assets/florence-chan-sophia.jpg';
import GhassanElkarim from '../assets/ghassan-elkarim-carl.jpg';
import HarryYu from '../assets/harry-yu-carl.jpg';
import HongtaoLi from '../assets/hongtao-li-carl.jpg';
import HussamBukhari from '../assets/hussam-bukhari-carl.jpg';
import JieRen from '../assets/jie-ren-carl.jpg';
import JingJi from '../assets/jing-ji-sophia.jpg';
import KarenQi from '../assets/karen-qi-sophia.jpg';
import KevinChan from '../assets/kevin-chan-carl.jpg';
import MarisaRamandt from '../assets/marisa-ramandt-sophia.jpg';
import MeimeiZhang from '../assets/meimei-zhang-sophia.jpg';
import MoeElYoussef from '../assets/moe-el-youssef-carl.jpg';
import SissiWang from '../assets/sissi-wang-sophia.jpg';
import StevenYou from '../assets/steven-you-sophia.jpg';
import SunnyYin from '../assets/sunny-yin-carl.jpg';
import TongWu from '../assets/tong-wu-sophia.jpg';
import TonyLiu from '../assets/tony-liu-carl.jpg';
import XianlingYu from '../assets/xianling-yu-carl.jpg';
import YifanLi from '../assets/yifan-li-carl.jpg';
import Incognito from '../assets/incognito.png';
import Avatar from '../assets/avatar.png';
import Mccree from '../assets/mccree.png';
import CarlRen from '../assets/carl.jpg';
import SophiaLi from '../assets/sophia.jpg';

export const SELECTED_PROFILE_LS_KEY = "selectedProfile";

export function MakeUnique(profile) {
    if (profile === AnonymousProfile) {
        let copy = {};
        copy.firstName = profile.firstName;
        copy.lastName = profile.lastName;
        copy.img = profile.img;
        copy.id = profile.id + shittyUUIDV4();
        return copy;
    }
    return profile;
}

export function IsAnonymous(profile) {
    return profile.id.startsWith(AnonymousProfile.id);
}

export function IsAnonymousId(profileId) {
    return profileId.startsWith(AnonymousProfile.id);
}

export const AnonymousProfile = {
    firstName: 'Anonymous',
    lastName: '',
    img: Incognito,
    id: 'Incognito'
};

export const Profiles = [
    AnonymousProfile,
    {
        firstName: 'Angela',
        lastName: 'Ho',
        img: AngelaHo,
        id: 'AngelaHo'
    },
    {
        firstName: 'Anna',
        lastName: 'Chan',
        img: AnnaChan,
        id: 'AnnaChan'
    },
    {
        firstName: 'Dave',
        lastName: 'Yu',
        img: DaveYu,
        id: 'DaveYu'
    },
    {
        firstName: 'Edwin',
        lastName: 'Wu',
        img: EdwinWu,
        id: 'EdwinWu'
    },
    {
        firstName: 'Florence',
        lastName: 'Chan',
        img: FlorenceChan,
        id: 'FlorenceChan'
    },
    {
        firstName: 'Ghassan',
        lastName: 'Elkarim',
        img: GhassanElkarim,
        id: 'GhassanElkarim'
    },
    {
        firstName: 'Harry',
        lastName: 'Yu',
        img: HarryYu,
        id: 'HarryYu'
    },
    {
        firstName: 'Hongtao',
        lastName: 'Li',
        img: HongtaoLi,
        id: 'HongtaoLi'
    },
    {
        firstName: 'Hussam',
        lastName: 'Bukhari',
        img: HussamBukhari,
        id: 'HussamBukhari'
    },
    {
        firstName: 'Jie',
        lastName: 'Ren',
        img: JieRen,
        id: 'JieRen'
    },
    {
        firstName: 'Jing',
        lastName: 'Ji',
        img: JingJi,
        id: 'JingJi'
    },
    {
        firstName: 'Karen',
        lastName: 'Qi',
        img: KarenQi,
        id: 'KarenQi'
    },
    {
        firstName: 'Kevin',
        lastName: 'Chan',
        img: KevinChan,
        id: 'KevinChan'
    },
    {
        firstName: 'Marisa',
        lastName: 'Ramandt',
        img: MarisaRamandt,
        id: 'MarisaRamandt'
    },
    {
        firstName: 'Meimei',
        lastName: 'Zhang',
        img: MeimeiZhang,
        id: 'MeimeiZhang'
    },
    {
        firstName: 'Moe',
        lastName: 'El-Youssef',
        img: MoeElYoussef,
        id: 'MoeElYoussef'
    },
    {
        firstName: 'Sissi',
        lastName: 'Wang',
        img: SissiWang,
        id: 'SissiWang'
    },
    {
        firstName: 'Steven',
        lastName: 'You',
        img: StevenYou,
        id: 'StevenYou'
    },
    {
        firstName: 'Sunny',
        lastName: 'Yin',
        img: SunnyYin,
        id: 'SunnyYin'
    },
    {
        firstName: 'Tong',
        lastName: 'Wu',
        img: TongWu,
        id: 'TongWu'
    },
    {
        firstName: 'Tony',
        lastName: 'Liu',
        img: TonyLiu,
        id: 'TonyLiu'
    },
    {
        firstName: 'Xianling',
        lastName: 'Yu',
        img: XianlingYu,
        id: 'XianlingYu'
    },
    {
        firstName: 'Yifan',
        lastName: 'Li',
        img: YifanLi,
        id: 'YifanLi'
    },
    {
        firstName: 'Shilin',
        lastName: 'He',
        img: Avatar,
        id: 'ShilinHe'
    },
    {
        firstName: 'Elizabeth',
        lastName: '',
        img: Avatar,
        id: 'Elizabeth'
    },
    {
        firstName: 'Kayla',
        lastName: '',
        img: Avatar,
        id: 'Kayla'
    },
    {
        firstName: 'Joey',
        lastName: '',
        img: Avatar,
        id: 'Joey'
    },
    {
        firstName: 'Ioan',
        lastName: 'Piscureanu',
        img: Avatar,
        id: 'IoanPiscureanu'
    },
    {
        firstName: 'Eileen',
        lastName: 'Zhao',
        img: Avatar,
        id: 'EileenZhao'
    },
    {
        firstName: 'Adrian',
        lastName: 'Harris',
        img: Avatar,
        id: 'AdrianHarris'
    },
    {
        firstName: 'McCree',
        lastName: '',
        img: Mccree,
        id: 'Mccree'
    },
    {
        firstName: 'Carl',
        lastName: 'Ren',
        img: CarlRen,
        id: 'CarlRen'
    },
    {
        firstName: 'Sophia',
        lastName: 'Li',
        img: SophiaLi,
        id: 'SophiaLi'
    }
].sort(function(a, b){
    if(a.firstName < b.firstName) { return -1; }
    if(a.firstName > b.firstName) { return 1; }
    return 0;
});

function shittyUUIDV4() {
    // credit: https://stackoverflow.com/a/2117523
    // this is shitty because Math.random() is not a cryptographically secure source
    // of entropy, so this is not a good UUID, but it's good enough for our purposes
    // there are warnings here: but these are all intentional so leaving them as-is
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
