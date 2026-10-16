# Referans incelemesi ve mimari tasarım kararları

İnceleme tarihi: 16 Ekim 2026. Çıktı: yerel, iki katlı AZES Gaming House konsepti.

## 1. Mimari3D videosu ve canlı deneyim

Kaynaklar: [61 saniyelik tanıtım videosu](https://www.youtube.com/watch?v=ZRQxLhRouI4), [canlı mimari tur](https://www.mimari3d.com/tanitim/).

Video açıklaması, videonun tamamına ait otomatik Türkçe konuşma metni ve canlı arayüz incelendi. Konuşma metni otomatik üretildiği için teknik terimlerin birebir yazımına dayanılmadı. Videonun oda kayıtları, tarayıcı üzerinden keşif, yüksek görsel kalite ve mobil kullanım üzerinde durduğu görüldü. Kaynak anlatımı, sonuç kalitesini kullanılan model ve tasarımın niteliğine bağlıyor.

Canlı örnekte beş kayıtlı bölüm bulunuyor: mutfak, salon, hol ve iki yatak odası. Görsel küçük resimli bölüm menüsü, sahne üzerindeki dairesel geçiş noktaları ve kat planı aynı mekânlara erişiyor. Seçilen bölümün adı ve alanı bilgi kartında gösteriliyor. Yükleme ekranını yüksek çözünürlük yüklemesinin tamamlandığına dair bir durum mesajı izliyor. Arayüzde gezinti, sunum, görüntü alma, ses ve gizleme kontrolleri bulunuyor. Bölüm geçişi, kat planının açılması ve sunumun etkinleşmesi doğrudan gözlendi.

Bu gözlemlerden referansın iç dosya formatı, lisans yapısı, render pipeline’ı veya ticari arka ucu kesin olarak çıkarılmadı. Görsel görünüşünden hareketle bir panorama, Gaussian Splat veya mesh teknolojisi kullandığı iddia edilmiyor. Bu teslimin yöntemi ise açık: Three.js ile oluşturulmuş gerçek geometrik bir model.

| Referansta görülen davranış | AZES yerel karşılığı |
| --- | --- |
| Yükleme ve hazır durumu | Başlangıç yükleme katmanı; kod ve sahne hazır olunca kapanır |
| Bölüm küçük resimleri | Doğrudan AZES 3D modelinden oluşturulan 12 oda önizlemesi |
| Bölüm seçimi ve kayıtlı görüş | Her oda için engelsiz göz seviyesi konumu ve bakış hedefi |
| Sahne üzeri konum işaretleri | Kat kesitinde tıklanabilen oda noktaları ve dışarıda giriş noktası |
| Fareyle bakış / yakınlaşma | Sürüklemeyle bakış veya orbit; tekerlekle yakınlaşma |
| Gez / çık | İçeride serbest yürüyüş ve bina/kat görünümüne dönüş |
| Bilgi kartı | Odanın amacı, konsept alanı, donatı ve kaynak bağlantısı |
| Kat planı ve konum noktaları | İki ayrı kat planı, oda geçişleri, hareket eden konum ve yön işareti |
| Otomatik sunum | Dış mekân, 12 bölüm ve son kat görünümünden oluşan 14 durak |
| Ekran görüntüsü | Geçerli 3D kadrajı PNG olarak görüntüleme ve indirme bağlantısı |
| Ses | Kullanıcı açtığında çalışan düşük seviyeli, yerelde üretilen ortam sesi |
| Arayüzü gizleme | H veya arayüz düğmesi; geri getirme düğmesi korunur |
| Mobil kullanım | Dar ekran düzeni, sürükleme, oda seçimi ve dokunmatik yürüyüş düğmeleri |
| Yüksek çözünürlüklü sunum | Cihaz piksel oranına göre WebGL render; uzaktan yüksek çözünürlüklü fotoğraf yüklenmez |

Eklenen işlevler: binanın dışını serbestçe inceleme, iki kat arasında geçiş, tavanı kaldırılmış kat görünümü, gündüz/gece, fiziksel merdiven, açılan kapılar, duvar ve büyük mobilya çarpışması, tam ekran, klavye yardımı. Bunlar referanstaki her işlevin teknik olarak özdeş olduğu anlamına gelmez. Kaynak modelin fotoğraf benzeri görüntüsü bu konseptin görsel kalite iddiası değildir.

## 2. A’dan Z’ye Espor yazılarından alınan yön

[Gaming House Nedir ve Önemli Bilgiler — 23 Eylül 2019](https://www.adanzyeespor.com/2019/09/gaming-house-nedir-ve-onemli-bilgiler.html) birlikte antrenman, koçluk ve gündelik takım yaşamını ilişkilendiriyor. [Gaming House (Oyun Evi) Faydaları — 27 Eylül 2019](https://www.adanzyeespor.com/2019/09/gaming-houseoyun-evi-faydalar.html) profesyonel çalışma ortamıyla düzenli beslenme, uyku ve hareketin birlikte düşünülmesini destekliyor. İki yazı da sürekli aynı evde kalmanın sorunlarını ve gaming office yaklaşımını gündeme getiriyor.

Bu tarihli yazılar güncel sektör istatistiği olarak kullanılmadı. Tasarım çıkarımımız: takımın gününü yalnızca bilgisayar sıraları etrafında kurmamak; çalışma ile dinlenmenin sınırını fiziksel olarak belirginleştirmek. Bu nedenle modelde yayın/antrenman alt katta, yataklar ve sessiz alan üst kattadır. Ortak sofra ve teras takım birlikteliğine; yatak çevresindeki bölücüler ve kişisel depolama mahremiyete ayrıldı. Koç/analiz alanı da oyuncu masasından farklı bir çalışma ortamı sağlar.

## 3. Yurt dışı örnekleri — dış ve iç mekân

Bu bölüm kaynaklarda açıklanan gerçek tesisleri özetler. AZES’ye aktarım sütunu ise bizim özgün tasarım yorumumuzdur. Her tesis konut değildir; kurumsal merkez, antrenman tesisi ve konaklama programı ayrı tutulmuştur. Açılış tarihli duyurular, tesislerin bugünkü işletme durumunu garanti eden kayıtlar olarak kullanılmadı.

### Team Liquid / Alienware Training Facility EU — Utrecht

[Takımın 2020 duyurusu](https://teamliquid.com/news/2020/09/16/the-alienware-training-facility-now-in-eu) antrenman, konaklama, dinlenme, beslenme ve akustik/ışık tasarımının bir arada ele alındığını doğruluyor. [Güncel tesis sayfası](https://teamliquid.com/facilities) çalışma, toplantı, yayın ve yemek işlevlerini tanımlıyor; Utrecht’te spor salonu erişimini dışarıdaki bir salon üzerinden açıklıyor. Bu farklı tarihler tek bir güncel fiziksel düzen olarak birleştirilmedi.

[VenhoevenCS’nin mimari proje açıklaması](https://venhoevencs.nl/projects/alienware-training-facility-eu-for-team-liquid/) tesisin Het Platform içinde, istasyon meydanına bakan bir konumda bulunduğunu ve kamusal geçitle şehirle ilişki kurduğunu belirtiyor. İçeride ziyaretçi ve oyuncu/ofis bölgelerini ayıran şeffaf kupa vitrini, aydınlık çalışma alanı, restoran ve değişken kullanımlı plan öne çıkıyor. Sıcak doğal malzemelerle teknolojik kimlik birlikte kullanılıyor.

**AZES’ye aktarımımız:** açıkça okunabilen giriş, cephede cam ve ahşap birlikteliği, karşılama/kupa köşesi, bağımsız analiz odası ve ortak sofra. Modeldeki bahçe, güneş panelleri, iki katlı bağımsız kütle ve teras bize ait önerilerdir; bu gerçek tesisin kopyası olarak sunulmaz.

### 100 Thieves / Cash App Compound — Los Angeles

[100 Thieves’in 2020 açılış duyurusu](https://100thieves.com/blogs/all/100-thieves-compound) antrenman, canlı yayın, içerik üretimi, giyim ve iş yönetimi işlevlerini aynı merkezde topluyor. [Teknik tedarikçi OpenDrives’ın vaka çalışması](https://opendrives.com/wp-content/uploads/2021/05/100-Thieves.pdf), özellikle ikinci PDF sayfası, dış cephede belirgin marka yazısı ve içeride prodüksiyon ortamını belgeliyor; stüdyo ile kurgu alanları arasındaki iş akışını açıklıyor.

**AZES’ye aktarımımız:** giriş saçak ve tabelası, kolay seçilen kurumsal kimlik, oyuncu antrenmanından ayrılan kamera/ışık/mikrofonlu içerik stüdyosu. Mağaza veya ticari etkinlik alanı bu daha küçük takım evi programına eklenmedi. Kaynak, yataklı gaming house olarak tanımlanmadı.

### MOUZ HQ — Hamburg

[AHH mimari proje sayfası](https://www.ahh.nl/en/projects/mouz) tarihî yapıdaki büyük cephe açıklıklarını, dışarıdan görülen kırmızı arenayı, sokak seviyesinin altındaki antrenman odalarını ve arenaya bakan üst kat ofislerini açıklıyor. Akustik cam ve sıcak ahşap, görsel bağlantıyı korurken odaklı çalışma sağlıyor. [MOUZ’un kendi mekân yazısı](https://mousesports.com/news/mouz-hq-creates-a-unique-connection/) takım çalışma düzenine ilişkin ek birincil kaynaktır.

**AZES’ye aktarımımız:** dışarıdan anlaşılan takım kimliği, iç dolaşımın okunabilirliği, cam bölmelerle görsel bağlantı ve çalışma/ortak yaşam ayrımı. Konut ölçeğini korumak için halka açık büyük arena tasarlamadık; Hamburg’daki tarihî cephe veya kırmızı salon taklit edilmedi.

### Fnatic × BMW — Berlin performans tesisi

[8 Haziran 2022 tarihli resmî duyuru](https://fnatic.com/news/fnatic-partners-with-bmw-to-open-brand-new-esports-performance-facility-in-berlin) spor salonu, mutfak, dinlenme, iki performans odası, içerik stüdyosu, maç inceleme alanı ve ofis tanımlıyor. Bu kaynak iç mekân programı açısından kullanıldı; dış cephe niteliği veya konaklama kapasitesi hakkında bu metinden sonuç çıkarılmadı.

**AZES’ye aktarımımız:** VOD odası, fiziksel hareket, ekransız mola ve içerik üretimini oyuncu sağlığı/performans döngüsünün parçası saymak. Kaynakta adı geçen yarış simülatörü bu sürümün programına alınmadı.

## 4. İki katlı özgün AZES programı

Kütle şeması 28 × 22 metredir. Kat yüksekliği 4,2 metre; göz seviyesi yaklaşık 1,7 metredir. Ana dolaşım iki yandaki bölümlere açılan merkezi bir omurgadır. Oda alanları bölge genişliği × derinliğinden türetilmiş şematik değerlerdir; duvarlar ve donatı düşülmüş net alan hesabı değildir.

| Kat | Bölüm | Şematik alan | Modelde görülen ana donatı |
| --- | --- | ---: | --- |
| Performans | Takım antrenman odası | 96 m² | 6 oyuncu istasyonu, ayrı çift ekranlı koç, akustik panel, ağ/UPS dolabı |
| Performans | Strateji / VOD | 84 m² | Büyük taktik ekranı, toplantı masası, pano |
| Performans | Yayın / içerik | 84 m² | Çift ekran, kamera, mikrofon, softbox, görüşme köşesi |
| Performans | Takım salonu | 96 m² | Oturma, konsol/TV, kupa vitrini, karşılama |
| Performans | Mutfak / yemek | 84 m² | Tezgâhlar, pişirme, buzdolabı ve ortak masa |
| Performans | Hareket / toparlanma | 84 m² | Koşu bandı, ağırlıklar, matlar ve bakım yatağı |
| Yaşam | Oyuncu yaşam A | 96 m² | 3 yatak, mahremiyet bölücüleri, komodin, depolama ve okuma ışığı |
| Yaşam | Oyuncu yaşam B | 84 m² | 3 yatak, mahremiyet bölücüleri ve bireysel depolama |
| Yaşam | Duş / bakım / çamaşır | 84 m² | Duşlar, tuvalet bölmeleri, lavabo ve çamaşır düzeni |
| Yaşam | Koç / yönetim | 96 m² | Çalışma masaları, görüşme ve dosyalama |
| Yaşam | Sessiz oda | 84 m² | Okuma, dinlenme, kitaplık, mat ve ekransız oturma |
| Yaşam | Açık teras | 84 m² | Pergola, dış mekân oturması, masa ve bitkiler |

Altı oyuncu yatağı iki yaşam bölümüne dağılır; bunlar altı tam kapalı özel yatak odası olarak tanıtılmıyor. Üst kattaki koç/yönetim odası yataklı konaklama odası değildir. Bahçe, yürüyüş yaklaşımı, üç araçlı ziyaretçi otoparkı, giriş bankları, gece aydınlatması ve çatıdaki güneş paneli geometrisi dış mekânı tamamlar. Panellerin enerji üretimi veya teknik tesisat kapasitesi simüle edilmez.

## 5. Malzeme, ışık ve gezinti

Görsel dil: açık beton, sıcak ahşap, grafit taşıyıcı/çerçeve, cam, kumaş ve sınırlı asit yeşili vurgu. Antrenmanda koyu halı ve teknik ışık; yaşamda ahşap ve yumuşak renk; ıslak hacimde karo; harekette kauçuk zemin kullanıldı. Dokular ve ekran grafikleri yerelde kodla üretilir.

Modelin tüm bölümleri aynı koordinat sistemindedir. Odalar arası yürüyüş gerçek hacim içindedir. Büyük mobilyalar ve duvarlar hareketi sınırlar. Merdiven yüksekliği adımlarla birlikte değişir; üst sahanlık, yan geçit ve korkuluklar bulunur. Menü ve plan geçişleri incelemeyi hızlandırır. Sunumdaki geçiş, oda kısayolu davranışıdır; gerçek bir yürüyüş rotası kaydı değildir.

## 6. Görsel kalite ve teslim sınırı

Bu sürüm kullanıcının onaylayabileceği, oynanabilir bir mekânsal konsepttir. Referanstaki fotoğraf benzeri malzeme/aydınlatma seviyesi elde edilmiş gibi sunulmaz. Aynı kalite hedeflenecekse bir sonraki tasarım aşamasında ayrıntılı mobilya modelleri, daha yüksek nitelikli malzemeler, pişirilmiş ışık veya lisanslı render/splat varlıkları üzerinde ayrıca çalışılır. Mevcut geometri, oda programı ve navigasyon sistemi buna temel olabilir.

Referans kodu, müziği veya mimari modeli indirilip yeniden dağıtılmadı. Kaynak görseller uygulama varlığı yapılmadı; araştırma bağlantıları bilgi amacıyla verildi. Her oda için belirtilen kaynak, o tasarımın düşünsel dayanağıdır; önerilen tüm ölçü ve donatıların kaynak tesiste aynen bulunduğunu ifade etmez.

Bu teslim yereldir. GitHub’a gönderilmedi, barındırma hizmetinde kayıt veya dağıtım oluşturulmadı, ana site kaynaklarına bağlanmadı. Test sonuçları ve otomasyon sınırları `DOGRULAMA.md` içindedir.
