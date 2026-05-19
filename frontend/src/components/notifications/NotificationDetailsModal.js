/*
Notification details modal.
Shows the full notification content without moving to a full page.
*/

export default function NotificationDetailsModal({
    notification,
    role,
    onClose,
    onOpenRelated,
    onAcceptInvitation,
    onDeclineInvitation,
    isUpdating
}) {
    if (!notification) {
        return null;
    }

    // Builds a readable sender name for the modal.
    function getSenderName(sender) {
        if (!sender) {
            return "System";
        }

        const fullName = `${sender.firstName || ""} ${sender.lastName || ""}`.trim();

        return fullName || sender.email || "System";
    }

    // Converts notification type values into short UI labels.
    function getNotificationTypeLabel(type) {
        if (type === "property_invitation") {
            return "Invitation";
        }

        if (type === "issue_created") {
            return "Issue";
        }

        if (type === "issue_status_updated") {
            return "Issue Update";
        }

        if (type === "contract_uploaded") {
            return "New Contract";
        }

        if (type === "contract_updated") {
            return "Contract Update";
        }

        if (type === "payment_created") {
            return "Payment";
        }

        if (type === "payment_late") {
            return "Late Payment";
        }

        if (type === "payment_status_updated") {
            return "Payment Update";
        }

        return "System";
    }

    // Payment status notifications are informational only and do not need navigation.
    const hasRelatedItem =
        notification.type !== "payment_status_updated" &&
        (notification.issue?._id || notification.property?._id);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6">
            <div className="w-full max-w-2xl rounded-3xl border border-orange-200 bg-[#FFF8F3] p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <span className="rounded-full border border-orange-200 bg-[#FFF1E3] px-3 py-1 text-xs font-semibold text-[#B45309]">
                            {getNotificationTypeLabel(notification.type)}
                        </span>

                        <h2 className="mt-4 text-2xl font-bold text-gray-900">
                            {notification.title}
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-gray-700">
                            {notification.message}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-500 transition hover:bg-orange-50 hover:text-gray-800"
                    >
                        ✕
                    </button>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-orange-200 bg-[#FFF3E8] p-4 shadow-sm">
                        <p className="text-sm font-medium text-gray-500">
                            From
                        </p>

                        <p className="mt-2 font-semibold text-gray-900">
                            {getSenderName(notification.sender)}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-orange-200 bg-[#FFF3E8] p-4 shadow-sm">
                        <p className="text-sm font-medium text-gray-500">
                            Date
                        </p>

                        <p className="mt-2 font-semibold text-gray-900">
                            {new Date(notification.createdAt).toLocaleString()}
                        </p>
                    </div>
                </div>

                {notification.property && (
                    <div className="mt-4 rounded-2xl border border-orange-200 bg-[#FFF3E8] p-4 shadow-sm">
                        <p className="text-sm font-medium text-gray-500">
                            Related property
                        </p>

                        <p className="mt-2 font-semibold text-gray-900">
                            {notification.property.fullAddress}
                        </p>
                    </div>
                )}

                {notification.issue && (
                    <div className="mt-4 rounded-2xl border border-orange-200 bg-[#FFF3E8] p-4 shadow-sm">
                        <p className="text-sm font-medium text-gray-500">
                            Related issue
                        </p>

                        <p className="mt-2 font-semibold text-gray-900">
                            {notification.issue.title}
                        </p>

                        {notification.issue.description && (
                            <p className="mt-2 text-sm leading-6 text-gray-700">
                                {notification.issue.description}
                            </p>
                        )}
                    </div>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    {role === "renter" &&
                        notification.type === "property_invitation" &&
                        notification.invitationStatus === "pending" && (
                            <>
                                <button
                                    type="button"
                                    onClick={onAcceptInvitation}
                                    disabled={isUpdating}
                                    className="rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    Accept
                                </button>

                                <button
                                    type="button"
                                    onClick={onDeclineInvitation}
                                    disabled={isUpdating}
                                    className="rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    Decline
                                </button>
                            </>
                        )}

                    {hasRelatedItem && (
                        <button
                            type="button"
                            onClick={onOpenRelated}
                            className="rounded-2xl bg-[#FF8A00] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E67C00]"
                        >
                            Open related item
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-2xl border border-orange-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-orange-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}