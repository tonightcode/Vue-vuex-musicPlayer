import { getLyric } from 'api/song'
import { ERR_OK } from 'api/config'
import { Base64 } from 'js-base64'
import axios from 'axios'

export default class Song {
  constructor({ id, mid, singer, name, album, duration, image, url }) {
    this.id = id
    this.mid = mid
    this.singer = singer
    this.name = name
    this.album = album
    this.duration = duration
    this.image = image
    this.url = url
  }

  getLyric() {
    if (this.lyric) {
      return Promise.resolve(this.lyric)
    }

    return new Promise((resolve, reject) => {
      getLyric(this.mid).then((res) => {
        if (res.retcode === ERR_OK) {
          this.lyric = Base64.decode(res.lyric)
          resolve(this.lyric)
        } else {
          reject('no lyric')
        }
      })
    })
  }
}

export function createSong(musicData, purl) {
  return new Song({
    id: musicData.songid,
    mid: musicData.songmid,
    singer: filterSinger(musicData.singer), // filterSinger 中处理一遍
    name: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval,
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
    url: purl
  })
}

// 获取歌曲的vkey
export function getSongInfo(songmid) {
  const url = '/api/getSongInfo'
  const songmidList = songmid.split(',')
  let quality = 'm4a'
  let mediaId = ''
  const guid = '1429839143'
  const uin = global.uin || '0'
  const fileType = {
    m4a: {
      s: 'C400',
      e: '.m4a'
    },
    128: {
      s: 'M500',
      e: '.mp3'
    },
    320: {
      s: 'M800',
      e: '.mp3'
    },
    ape: {
      s: 'A000',
      e: '.ape'
    },
    flac: {
      s: 'F000',
      e: '.flac'
    }
  }
  const fileInfo = fileType[quality]
  const file = songmidList.map(_ => `${fileInfo.s}${_}${mediaId || _}${fileInfo.e}`)
  const data = {
    req_0: {
      module: 'vkey.GetVkeyServer',
      method: 'CgiGetVkey',
      param: {
        filename: file,
        guid,
        songmid: songmidList,
        songtype: [0],
        uin,
        loginflag: 1,
        platform: '20'
      }
    },
    loginUin: uin,
    comm: {
      uin,
      format: 'json',
      ct: 24,
      cv: 0
    }
  }
  const params = Object.assign({
    format: 'json',
    sign: 'zzannc1o6o9b4i971602f3554385022046ab796512b7012',
    data: JSON.stringify(data)
  })
  return axios.get(url, {
    params: params
  }).then((res) => {
    return Promise.resolve(res)
  })
}

function filterSinger(singer) {
  let ret = []
  if (!singer) {
    return ''
  }
  singer.forEach((s) => {
    ret.push(s.name)
  })
  return ret.join('/')
}

