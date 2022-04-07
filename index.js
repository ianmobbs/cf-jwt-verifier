import jose from 'node-jose';
import fetch from 'node-fetch';

console.log("=======================")
console.log("Cloudflare JWT Verifier")
console.log("=======================")

const CF_CERTS_ENDPOINT = "https://api.cloudflare.com/client/v4/internal/certs"

// goodJwts contains JWTs that have been signed such that they can be verified using publicly available Cloudflare certificates
const goodJwts = [
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJrZXkxIjoidmFsMSJ9.Sabdr_pu3CMyPWiQ4OEuIiuWsUVUPbYFT202MAmhkAwtMzjsOdx7crFY-ca_IVrMMqo76UxPNxBDt_Xmjd0sRm8yjUaVSL05XZhdFp5CTFdXxzP0ZaBznD3dZRzzsR1XF2fvQDci__cjEUI2Jj0SHJZmZdW4UQH0iHi6ifcDV0MC3VvTzD9NmGaPrkSqxiao5pq4TvGzVtq8cEQza1eap6IVNV-WDnF4Gyy2-eBJ-Wc4JNTApmDzoETXlgVKS4rHijMzequl_JuynJRtyslxTB59JGrIolr7h80DG63UbXGEklhlCrLuaCrB6mhNcPJUAmPEGC7TnjQFEzf7XNI9yw",
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJrZXkyIjoidmFsMiJ9.CYTsxpnoYYuDduAJ7IeeAcqEObiy8oWzlD8jReXb0IB1SFzeIW-yDnO3rE-RvhgBiwZtJ_dUQnYlalphuPB5Pm_wKyJt8QXe-Z8tddimsZwCcbDV3ho1GiSjrX7b273_gcTCJMwTpelqXaIrsOya-PGkaaW4NU4IgAlECtlPFI_KU-0AKSzAoTom-T2fCcMgC5R0gk1QeMVVruSHiKs-nDHuQ8M4FXLrU-vNAj0Xx0WLh89hOCu3pZNyYNpYGdmRV15JlT4L0FWhAn_BoEOBHdjaoZrUXfNAnlZmRxZeOXqZY3HTLV2kT_w14bUfnzRT02cMTcPijtg6kYmT1hGsjg",
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJrZXkzIjoidmFsMyJ9.A8wV_es60LP1VoWIjea-k2RzZz4PxIl-FyfO92CQEHNEcMKdE8elBCCRRdd1GbuiTDe0dluxRl-Hu4sNfMWw-_q_3zDE3mAcMY1Yjmwu6004qaTqFh5fYPic-5i7R1RAYMbUGbqdpajZsdlW_LLsoVTzyEUn5V6IWCngwc09p_ZEihyUTQIT_UpIuBhgA0W1cioItrc62SOMxBPo0dgLTD1_RxywN04j1Lq1ZIDGPer8-lFfxZcEsWx_pV5awMGsfassy6jnCZtt9HsFnqPJ4t8EZnZ0TPfUGn2YTAu_02zQ5cbF3RaZqMS3GenqevHRRZJKW5lbw1Q6s3MpntITFw"
]

// badJwts containt the same payload as goodJwts, but were signed using a different certificate
// We will ensure these are not verifiable using the public Cloudflare JWKS
const badJwts = [
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJrZXkxIjoidmFsMSJ9.f8-YVLRhGS-uPgQnfE-pKdnbkExICiZqUhC_ic5X-j2oVrWUoG7LblGCFMsTggiJLJxJk5VS6sgSVynRRfFdLrYeayGgXiOSNn9J9Hg8IrwZsCtsoEd_yIeAllIrXfF7mvrLbr_0iC0szTMmMqBW4bi0rRA1vd0-oNzae5CONDikSPQCuANo--9i6zeHpPJGId4FQ69oxRkW8gZj4bunkK8rY6fg6OL_N57ScdYaYx_4jPoiKUjqxDu6kZA2mIH342pQhHDTJAi5UfvNFGIwx02K61a-v3pIFTR-oMJe9rKgYVjxWB6ZlUidc5_cA5qpfKOm2t0XeCqthjbN7Cejwg",
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJrZXkyIjoidmFsMiJ9.zYOt2hxcvsDYr8xV2Zl4CHXy5-CsZ3pnwGtvAporhyfWKeb-vJ4IVA3_YMNVVYfCCTS2_UPk6v-O66BQgTOOmptGdMKNdRSpuNYgdxxXxSHSiOXxAN-t0_MiZbMr-yRiackXo6hrL282Jp-8xVo_tXC0YpEA89KX9R14LohepGzSiG6sAWL4JEIJfE6kT7KZH1m-weA_jZ9YlhG-XOabBU0Wa-3HO7k1oQzQtCv2ykAc6P8hRULOFarLe4EL7EcdB6q-4iri0DXzcvLhU6r6HXSO2OOwIVX1rarQQN1S6LbJg5NLNL2jd5k0F_zoHTZloUgak722Ea4STjvMQLFfhQ",
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJrZXkzIjoidmFsMyJ9.Wk1QRTHJQ-6NZdtoLY21dQudkOEA6WU_ctm1gYBin7ajbXIOxg4Wiu-Enwa2Tvv3ma9rauUr9AAWX59WPuwE4t-CEY8O_b0ir2z_lpuyzN3qIUZ57442kZzRqLKQWiFYHgGLJdaf25YQk2T_wCuj8lgtod8cZLV47CdCZyqzPxdNx3BVsRt8pqTGonRB1fExtpOo0V79z1KyNmyuskD8fW81v0b7h_CUNmaGNplCR60sGLu1sPRkVHY5kHy0TUMAkqT5ApL5Ccqt_Emjw8Y_XZrO8l6AGgifgt7DYeyV0AlXQFXRR8KIf-S7mmzfjq2V1ThwXJ4yZ9_1738T_qXZJw"
]

console.log("Fetching latest certificates from Cloudflare...\n")
const certRequest = await fetch(CF_CERTS_ENDPOINT)
const certs = await certRequest.json()
const keystore = await jose.JWK.asKeyStore(certs);
const verifier = jose.JWS.createVerify(keystore)

console.log("[STARTING GOOD JWT VERIFICATION]")
for (const goodJwt of goodJwts) {
    console.log("Verifying Good JWT...")
    try {
        const result = await verifier.verify(goodJwt)
        console.log(JSON.stringify(JSON.parse(result.payload)))
        console.log("JWT successfully verified!")
    } catch (e) {
        console.log("[ERR] Good JWT rejected by Cloudflare JWKS - this should never happen")
        break
    }
}
console.log("\n")

console.log("[STARTING BAD JWT VERIFICATION]")
for (const badJwt of badJwts) {
    console.log("Verifying Bad JWT...")
    try {
        await verifier.verify(goodJwt)
        console.log("[ERR] Bad JWT successfully verified - this should never happen")
        break
    } catch (e) {
        console.log("Bad JWT successfully rejected using Cloudflare JWKS")
    }
}
