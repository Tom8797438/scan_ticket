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

      <p class="decode-result">
        Dernier résultat : <b>{{ result }}</b>
      </p>

      <div class="scan-response" v-if="scanResponse">
        <p><b>Statut du scan :</b> {{ scanResponse.scan_status }}</p>
        <p v-if="scanResponse.scan_status === 'valid'">
          <b>Message :</b> Ticket valide, accès autorisé !
        </p>
        <p v-if="scanResponse.scan_status === 'duplicate'">
          <b>Message :</b> Ticket déjà scanné, accès refusé.
        </p>
        <p v-if="scanResponse.scan_status === 'invalid'">
          <b>Message :</b> Ticket invalide, vérifiez le QR code.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { QrcodeStream } from "vue-qrcode-reader";
import { useScanStore } from "@/stores/scanStore.js"; // Importer le store Pinia

export default {
  components: {
    QrcodeStream,
  },
  setup() {
    const scanStore = useScanStore(); // Initialiser le store
    const result = ref(""); // Résultat du dernier scan
    const scanResponse = ref(null); // Réponse du scan

    // Fonction exécutée lors de la détection d'un QR code
    async function onDecode(decodedString) {
  try {
    // Construire un objet avec le champ `qr_code`
    const parsedData = { qr_code: decodedString };
    console.log("QR Code détecté :", decodedString);
    // Vérifie si `qr_code` est présent
    if (parsedData.qr_code) {
      const response = await scanStore.scanTicket(parsedData.qr_code); // Utilise `qr_code`
      scanResponse.value = response; // Met à jour la réponse du scan
      console.log("Réponse du scan :", response);
    } else {
      scanResponse.value = { status: "error", message: "QR Code invalide (pas de QR_CODE)." };
      console.error("QR Code invalide :", parsedData);
    }
  } catch (error) {
    console.error("Erreur lors de la validation du scan :", error);
    scanResponse.value = { status: "error", message: "Erreur interne." };
  }
}

    // Gérer la sélection de la caméra
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
            label: `${label} (ID: ${deviceId})`,
            constraints: { deviceId },
          })),
        ];
      } catch (err) {
        console.error("Erreur lors de la configuration de la caméra :", err);
      }
    }

    // Gestion des formats de code-barres
    const barcodeFormats = ref({
      qr_code: true, // Activer uniquement le QR code
    });

    const selectedBarcodeFormats = computed(() =>
      Object.keys(barcodeFormats.value).filter((format) => barcodeFormats.value[format])
    );

    // Gérer les erreurs de scan
    function onError(err) {
      console.error("Erreur lors du scan :", err);
    }

    // Détection qr-code 
    function onDetect(detectedCodes) {
  console.log("Codes détectés :", detectedCodes);

  // Extraire le contenu du QR code (rawValue)
  if (detectedCodes && detectedCodes.length > 0) {
    const rawValue = detectedCodes[0].rawValue; // Prend le premier code détecté
    result.value = rawValue; // Met à jour la variable result avec le contenu du QR code
    console.log("Contenu décodé :",result, rawValue);
    // Appeler onDecode avec le contenu décodé
    onDecode(rawValue);
  } else {
    result.value = "Aucun code détecté"; // Gère le cas où aucun code n'est détecté
  }
}

    return {
      result,
      scanResponse,
      selectedConstraints,
      constraintOptions,
      barcodeFormats,
      selectedBarcodeFormats,
      onDecode,
      onError,
      onCameraReady,
      onDetect,
    };
  },
};
</script>

<style scoped>
.selection-camera{
  color:#000;
}

.decode-result{
  color: #000;
}

.scan-response {
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  color:#000;
}
.scan-response p {
  margin: 5px 0;
}
</style>
