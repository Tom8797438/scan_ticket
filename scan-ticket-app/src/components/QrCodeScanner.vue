<template>
  <div class="cadre-scan">
    <div class="camera-frame">
      <qrcode-stream
        :constraints="selectedConstraints"
        :formats="selectedBarcodeFormats"
        @decode="onDecode"
        @error="onError"
        @detect="onDetect"
        @camera-on="onCameraReady"
      />
    </div>
    <div class="section-scan">
      <p class="selection-camera">
        Sélection de la caméra
        <select v-model="selectedConstraints" class="selection-camera">
          <option
            v-for="option in constraintOptions"
            :key="option.label"
            :value="option.constraints"
          >
            {{ option.label }}
          </option>
        </select>
      </p>

     <!-- <p class="decode-result">
         Dernier résultat : <b>{{ result }}</b> 
      </p>-->

      <!-- Mise à jour : Utilisation de `status` -->
      <div class="scan-response" v-if="scanResponse">
        <p><b>Statut du scan :</b> {{ scanResponse.status }}</p>
        <p v-if="scanResponse.status === 'success'">
          <b>Message :</b> Ticket valide, accès autorisé !
        </p>
        <p v-if="scanResponse.status === 'canceled'">
          <b>Message :</b> Ticket déjà scanné, accès refusé.
        </p>
        <p v-if="scanResponse.status === 'error'">
          <b>Message :</b> Ticket invalide, vérifiez le QR code.
        </p>
        <p><b>Détails :</b> {{ scanResponse.message }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { QrcodeStream } from "vue-qrcode-reader";
import { useScanStore } from "@/stores/scanStore.js";

export default {
  components: {
    QrcodeStream,
  },
  setup() {
    const scanStore = useScanStore();
    const result = ref(""); // Résultat brut du dernier scan
    const scanResponse = ref(null); // Réponse après validation

    // Fonction exécutée lors de la détection d'un QR code
    async function onDecode(decodedString) {
      try {
        console.log("QR Code brut détecté :", decodedString);

        // Décoder le JSON du QR code
        const parsedData = JSON.parse(decodedString);
        console.log("Contenu décodé :", parsedData);

        // Vérifiez si les clés nécessaires sont présentes
        if (parsedData.documentId && parsedData.qr_code) {
          // Passer l'objet complet au store
          const response = await scanStore.scanTicket(parsedData);
          scanResponse.value = response; // Met à jour la réponse du scan
          console.log("Réponse du scan :", response);
        } else {
          throw new Error("QR Code invalide : DocumentId ou QR_CODE manquant.");
        }
      } catch (error) {
        console.error("Erreur lors de la validation du scan :", error);
        scanResponse.value = { status: "error", message: error.message };
      }
    }

    // Détection des QR codes
    function onDetect(detectedCodes) {
      console.log("Codes détectés :", detectedCodes);

      if (detectedCodes && detectedCodes.length > 0) {
        const rawValue = detectedCodes[0].rawValue;
        result.value = rawValue;
        console.log("Contenu détecté brut :", rawValue);
        onDecode(rawValue); // Passe le contenu détecté à `onDecode`
      } else {
        result.value = "Aucun code détecté";
      }
    }

    const selectedConstraints = ref({ facingMode: "environment" });
    const constraintOptions = ref([
      { label: "Caméra arrière", constraints: { facingMode: "environment" } },
      { label: "Caméra avant", constraints: { facingMode: "user" } },
    ]);

    async function onCameraReady() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(({ kind }) => kind === "videoinput");

        constraintOptions.value = [
          ...constraintOptions.value,
          ...videoDevices.map(({ deviceId, label }) => ({
            label: label.length > 30 ? `${label.slice(0, 30)}...` : label, // Tronquer le label si nécessaire
            constraints: { deviceId },
          })),
        ];
      } catch (err) {
        console.error("Erreur lors de la configuration de la caméra :", err);
      }
    }

    const barcodeFormats = ref({
      qr_code: true, // Activer uniquement le QR code
    });

    const selectedBarcodeFormats = computed(() =>
      Object.keys(barcodeFormats.value).filter((format) => barcodeFormats.value[format])
    );

    function onError(err) {
      console.error("Erreur lors du scan :", err);
    }

    return {
      result,
      scanResponse,
      selectedConstraints,
      constraintOptions,
      barcodeFormats,
      selectedBarcodeFormats,
      onDecode,
      onDetect,
      onError,
      onCameraReady,
    };
  },
};
</script>

<style scoped>
@import '@/assets/styles/QrCodeScanner.css'

</style>
