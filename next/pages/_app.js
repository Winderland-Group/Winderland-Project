import '@/styles/globals.css';
import "bootstrap/dist/css/bootstrap.min.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

// -----各自主頁css檔案 start-----
import '@/styles/_dashboard.css';
import '@/styles/_a-style.sass';
import '@/styles/_a-id-style.sass';
import '@/styles/Header.css';
import '@/styles/home.css';
import '@/styles/_tarot_and_course.css';
import '@/styles/_cart.css';
import '@/styles/event.css';
import '@/styles/product.css';
import '@/styles/product-detail.css';
// -----各自主頁css檔案 end-----

// import其他套件
import { useEffect } from "react";
// import { useAuth } from '@/hooks/use-auth'
import { AuthProvider } from '@/hooks/use-auth';  // 管理會員狀態
import { CartProvider } from '@/context/CartContext';
import NextTopLoader from 'nextjs-toploader'; // 換頁進度條－nextjs-toploader
import swal from 'sweetalert';   // 美麗彈跳窗
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // 引入 React Query
import ProtectedRoute from '@/components/member/ProtectedRoute'; 

// 創建一個 QueryClient 實例
const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    require("bootstrap");
  }, []);
  
  // 使用自訂在頁面層級的版面(layout)
  const getLayout = Component.getLayout || ((page) => page);

   // 決定是否需要使用 ProtectedRoute
   const WrappedComponent = Component.requireAuth
   ? (props) => (
       <ProtectedRoute>
         <Component {...props} />
       </ProtectedRoute>
     )
   : Component;

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <NextTopLoader color="#fff777" />
          {getLayout(<WrappedComponent {...pageProps} />)}
        </CartProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
