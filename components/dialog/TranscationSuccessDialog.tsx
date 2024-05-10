import React, { Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Player } from "@lottiefiles/react-lottie-player";
import SuccessJson from "@/public/json/success.json";

const TransactionSuccessDialog = ({
  openSuccess,
  setOpenSuccess,
  message,
  amount,
  currency,
}: {
  openSuccess: boolean;
  setOpenSuccess: Dispatch<SetStateAction<boolean>>;
  message: string;
  amount: string;
  currency: string;
}) => {
  return (
    <Dialog open={openSuccess} onOpenChange={setOpenSuccess}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="mb-[5px]">{message}</DialogTitle>
          <DialogDescription>
            Confirming Payment of {amount}{" "}
            {currency === "usdc" ? "USDC" : "KSH"}
          </DialogDescription>
          <Player
            keepLastFrame
            autoplay
            src={SuccessJson}
            style={{ height: "200px", width: "200px" }}
          ></Player>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionSuccessDialog;
