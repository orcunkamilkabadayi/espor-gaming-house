# AZES Espor Takım Evi — yerel 3D konsept

[Canli 3D tur](https://www.orcunkamilkabadayi.com/gaming-house/)

**Başlamak için `AZES-Gaming-House.html` dosyasına çift tıklayın.**

Tek dosyada JavaScript, Three.js motoru, stiller, model ve üretilen dokular bulunur. Kurulum, internet, hesap veya sunucu gerekmez. Chrome, Edge veya Firefox’un WebGL destekleyen güncel bir sürümünü kullanın. Kaynak bağlantılarına tıklamak dışında deneyim ağ isteği yapmaz.

## Deneyim

- İki kat, 12 ana mekân; 6 oyuncu istasyonu ve ayrı koç masası; 6 yatak.
- Dış cephe, bahçe, giriş, ziyaretçi otoparkı, araçlar, güneş panelleri ve açık teras.
- Gerçek üç boyutlu iç gezinti, duvar/mobilya çarpışması, kapılar ve yürünebilir merdiven.
- Küçük önizlemeli oda menüsü, bilgi kartları ve tıklanabilir kat planı.
- Bina çevresinde döndürme / yakınlaşma ve katların üstten kesit görünümü.
- Otomatik 14 duraklı sunum, gece/gündüz, isteğe bağlı ortam sesi, fotoğraf, tam ekran ve arayüzü gizleme.
- Dokunmatik bakış ve yön düğmeleri; masaüstü/mobil yerleşim.

## Kullanım

| Kontrol | İşlev |
| --- | --- |
| Fareyi basılı tutup sürükleme | Dışarıda binayı döndürme, içeride etrafa bakma |
| Tekerlek | Yakınlaşma; içeride görüş açısını ayarlama |
| WASD veya yön tuşları | İçeride yürüme |
| Shift | Daha hızlı yürüme |
| E | Yakındaki kapıyı açma/kapatma |
| M | Kat planını açma/kapatma |
| F | Tam ekran |
| H | Arayüzü gizleme/gösterme |
| Esc | Sunumu durdurma / gezintiden kat görünümüne dönme |
| Kat planında veya menüde bir oda | Odaya doğrudan geçiş |
| İçeride zemine çift tıklama | Uygun bir zemin noktasına kısa geçiş |

Merdiven ortak koridorun arkasındadır. Üst sahanlığa çıktıktan sonra kenar geçidinden yaşam katına ulaşabilirsiniz. Kat düğmeleri ve plan doğrudan geçiş de sunar. Açılan bilgi kartı sağ üstündeki × ile kapanır. Fotoğraf düğmesi mevcut 3D kadrajı PNG olarak önizler; “Fotoğrafı kaydet” bağlantısı indirmeyi başlatır.

## Dosyalar

- `AZES-Gaming-House.html`: önerilen, taşınabilir tek HTML teslimi.
- `index.html`, `styles.css`, `gaming-house.js`: ayrı dosyalı eşdeğer sürüm.
- `src/`: düzenlenebilir model, tur davranışları ve oda verileri.
- `REFERANS-INCELEME.html` / `.md`: kaynaklar, özellik karşılaştırması ve mimari kararlar. Tek HTML sürümünde bu rapor ayrıca gömülüdür; “Konsept hakkında” içinden açılabilir.
- `DOGRULAMA.md`: gerçekleştirilen testler ve kontrol sınırları.
- `build.mjs`: kaynakları çevrimdışı pakete dönüştürür. Yeniden derlemek için bu çalışma alanında `node ciktilar/projeler/2026-10-16-espor-gaming-house/build.mjs` çalıştırılır; mevcut kök `three` ve `esbuild` bağımlılıkları kullanılır. HTML’yi kullanmak için derleme gerekmez.
- `verify.mjs` / `qa-results.json`: gerçek modelin oda erişimini, çarpışma güvenliğini ve HTML paketini kontrol eden küçük doğrulama aracı ve son sonucu.

Bu sürüm özgün, prosedürel bir mimari konsepttir. Referanstaki fotoğraf benzeri görsellik aynı düzeyde üretilmiş değildir; referansın 3D modeli, malzemeleri, müziği veya kodu kopyalanmadı. Mekânsal gezinme ve sunum işlevleri bu bina için yeniden uygulandı. Alanlar şematik program büyüklükleridir; ölçülmüş net alan veya uygulama projesi değildir.

Yayına alınmadı; mevcut web sitesine veya barındırma ayarlarına eklenmedi.
