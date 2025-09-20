import React, { useEffect } from "react";
import { api } from "../services/api";

/*
 ServiceWorkerRegistration.jsx
 - Registra service worker em /sw.js
 - Pede permissão de Notification e envia subscription ao backend (VAPID public key buscada do backend)
 - Armazena endpoint em localStorage para suportar unsubscribe posterior (logout)
*/

export default function ServiceWorkerRegistration() {
  useEffect(()=> {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then(async (reg) => {
        console.log("Service worker registrado", reg);

        // Tenta registrar push subscription (se VAPID pública estiver disponível)
        if ("PushManager" in window) {
          try {
            const perm = await Notification.requestPermission();
            if (perm === "granted") {
              // buscar vapid public key do backend
              try {
                const vapidResp = await fetch((import.meta.env.VITE_API_URL || "http://localhost:8000") + "/notifications/vapid_public");
                if (vapidResp.ok) {
                  const json = await vapidResp.json();
                  const vapidPublicKey = json.vapid_public_key;
                  if (vapidPublicKey && reg.pushManager) {
                    // se já houver subscription, reutiliza
                    let sub = await reg.pushManager.getSubscription();
                    if (!sub) {
                      sub = await reg.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
                      });
                    }
                    // envia ao backend e grava endpoint localmente
                    await api.sendSubscription(sub);
                    try { localStorage.setItem("sw_subscription_endpoint", sub.endpoint); } catch(e){/* ignore */ }
                    console.log("Subscription enviada ao backend");
                  }
                }
              } catch (e) {
                console.warn("Não foi possível obter VAPID key ou subscrever:", e);
              }
            }
          } catch (err) {
            console.warn("Push subscription falhou", err);
          }
        }
      }).catch(err => console.warn("Registro SW falhou", err));
    }
  }, []);

  return null;
}

/* helper: convert VAPID key */
function urlBase64ToUint8Array(base64String) {
  if (!base64String) return null;
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
