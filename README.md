# StudyManager – Thực hành 4: API & Offline Mode

Ứng dụng quản lý học tập viết bằng **React Native CLI + TypeScript** (không dùng Expo).
Dữ liệu lấy từ REST API (`json-server`), có cache bằng AsyncStorage, hàng đợi thao tác offline và tự đồng bộ khi có mạng.

> Đề bài ghi Expo/`.js`; bài này dùng React Native CLI và `.ts/.tsx`. Tên file, vị trí thư mục và chức năng giữ đúng cây thư mục của đề (chỉ đổi đuôi file).

## 1. Cài đặt

```bash
# trong dự án React Native CLI (template TypeScript)
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
npm install @react-native-async-storage/async-storage @react-native-community/netinfo
cd ios && pod install && cd ..      # chỉ iOS
```


```bash
npx react-native start --reset-cache
npx react-native run-android      # hoặc run-ios
npx tsc --noEmit                  # kiểm tra kiểu
```


## 2. Chạy server giả lập

```bash
npm install -g json-server@0.17.4
json-server --watch db.json --host 0.0.0.0 --port 3000 --delay 800
```

`BASE_URL` nằm trong `src/config.ts`:

| Thiết bị | Địa chỉ |
|---|---|
| Android emulator | `http://10.0.2.2:3000` (tự chọn) |
| iOS simulator | `http://localhost:3000` (tự chọn) |
| Điện thoại thật cùng Wi-Fi | điền IP LAN vào `DEV_HOST` trong `src/config.ts` |
| Điện thoại Android cắm USB | `adb reverse tcp:3000 tcp:3000` rồi đặt `DEV_HOST = 'localhost'` |

Lưu ý gọi HTTP (không phải HTTPS):
- **Android**: bản debug của template RN đã bật `usesCleartextTraffic`. Nếu gặp `Network request failed`, kiểm tra `android/app/src/debug/AndroidManifest.xml` có `android:usesCleartextTraffic="true"`.
- **iOS**: `localhost` hoạt động sẵn; nếu gọi IP LAN bị chặn, thêm ngoại lệ ATS vào `Info.plist`.

## 3. Luồng dữ liệu

```
Màn hình ──► Context / Hook ──► Service ──► client.request ──► API (json-server)
 (screens)   useAppData          (api/)       timeout 10s          │
              useCachedQuery                  lỗi chuẩn hóa        │
                   │                                                │
                   ├── đọc/ghi ──► Cache  (AsyncStorage: { data, savedAt })
                   │
                   └── ghi (PATCH/POST) ─┬─ online : gửi ngay (cập nhật lạc quan)
                                         │            · thành công  → ghi vào dữ liệu gốc + cache
                                         │            · lỗi HTTP    → hoàn tác + báo lỗi
                                         │            · mất mạng    → vào Outbox
                                         └─ offline: ──► Outbox (AsyncStorage) ──► useOutboxSync
                                                          khi có mạng: gửi lần lượt ──► API
```

- **Đọc (cache trước, mạng sau)** – `useCachedQuery(key, fetcher)`: hiển thị cache ngay, nếu có mạng thì gọi API rồi ghi đè cache. Có mạng trở lại thì tự tải lại. Lỗi chỉ hiện (`ErrorView` + "Thử lại") khi chưa có dữ liệu nào để hiển thị.
- **Ghi** – `AppDataContext.submit`: dữ liệu hiển thị luôn là *dữ liệu server + các thao tác chưa hoàn tất* (đang gửi hoặc nằm trong Outbox), nên giao diện đổi ngay và nhãn "Chưa đồng bộ" tự biến mất khi thao tác rời hàng đợi.
- **Gộp thao tác**: nhiều lần sửa cùng một mục khi offline (ví dụ đổi trạng thái 1 bài tập hai lần) được gộp thành một `PATCH`; sửa bài tập vừa tạo offline thì sửa thẳng vào `POST` đang chờ.
- **Dùng chung dữ liệu giữa các tab** – `AppDataContext` giữ `student, courses, assignments, grades`; đổi trạng thái ở tab Bài tập thì Trang chủ, Chi tiết môn học, badge trên tab cập nhật theo.

## 4. Xử lý xung đột (B5)

Mỗi thao tác sửa (`PATCH`) mang `createdAt` (thời điểm người dùng thực hiện, cũng là `updatedAt` sẽ ghi lên server). Khi đồng bộ, với từng `PATCH`, ứng dụng `GET` bản ghi hiện tại trên server rồi so sánh:

| Điều kiện | Xử lý |
|---|---|
| `server.updatedAt` **mới hơn** `createdAt` của thao tác offline | **Ưu tiên dữ liệu server**: bỏ thao tác khỏi hàng đợi, không ghi đè, hiện thông báo "N thay đổi (…) bị bỏ qua vì dữ liệu trên máy chủ mới hơn" và tải lại dữ liệu từ server |
| Ngược lại | Gửi `PATCH`, server cập nhật theo thao tác offline |

`POST` (thêm bài tập mới) không có bản ghi cũ nên không xung đột. Lý do chọn "server mới hơn thì thắng": tránh ghi đè thay đổi người khác đã làm sau thời điểm sinh viên sửa offline; dữ liệu bị bỏ qua được báo rõ để sinh viên sửa lại nếu cần. Hạn chế: so sánh dựa vào đồng hồ máy, nên lệch giờ nhiều có thể cho kết quả sai.

## 5. Kiểm thử theo đề (mục 6)

| # | Kịch bản | Cách thực hiện |
|---|---|---|
| 1 | Tắt server, mở app lần đầu | Xóa dữ liệu app, tắt json-server, mở app → `ErrorView` + "Thử lại" |
| 2 | Có mạng rồi bật máy bay, khởi động lại | Banner "Bạn đang offline" + "Cập nhật lần cuối: HH:mm, dd/MM/yyyy", dữ liệu từ cache |
| 3 | Offline: đánh dấu 2 bài xong + thêm 1 bài | Giao diện đổi ngay, 3 mục có nhãn "Chưa đồng bộ" |
| 4 | Tắt máy bay | Tự đồng bộ, hiện "Đã đồng bộ 3 thay đổi", nhãn biến mất, `db.json` đổi |
| 5 | Offline sửa họ tên + sửa `db.json` với `updatedAt` mới hơn | Bật mạng → giữ dữ liệu server + thông báo bỏ qua thay đổi |
| 6 | Tìm môn không tồn tại / lọc học kỳ rỗng | `EmptyState` thân thiện |
| 7 | Kéo để làm mới | `refreshing` + `onRefresh` trên mọi danh sách |

Mẹo cho kịch bản 5: sửa `updatedAt` của `students[0]` trong `db.json` thành thời điểm sau lúc bạn sửa họ tên offline (ví dụ `2099-01-01T00:00:00Z`).

## 6. Cấu trúc thư mục

Theo đúng mục 5 của đề, đuôi `.ts/.tsx`. File thêm ngoài danh sách: `src/types.ts`, `src/navigation/stackOptions.ts`, `src/components/common/{Card,Badge,SectionTitle,Toast}.tsx`, và các hook truy vấn chi tiết `src/hooks/{useSessions,useCourseDetail,useSessionDetail,useAssignmentDetail,useGradeDetail,useToggleAssignment}.ts` (để màn hình chỉ gọi hook, không gọi service).

Phân tầng: `screens → components / hooks / context` · `hooks, context → api / storage / utils` · `api → config` · `storage → keys`.
